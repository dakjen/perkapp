import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil' as any,
})

// ── Pricing ───────────────────────────────────────────────────────────────
export const BASE_FEE_CENTS = 1900        // $19/mo
export const PER_PERSON_CENTS = 500       // $5/mo per member over 3
export const FREE_MEMBERS = 3

export function calcMonthlyPrice(memberCount: number): number {
  return BASE_FEE_CENTS + Math.max(0, memberCount - FREE_MEMBERS) * PER_PERSON_CENTS
}

export const DISCOUNT_TIERS = [
  { min: 0,     max: 999,      discount: 0,  label: 'Standard' },
  { min: 1000,  max: 4999,     discount: 10, label: 'Bronze'   },
  { min: 5000,  max: 9999,     discount: 20, label: 'Silver'   },
  { min: 10000, max: Infinity, discount: 30, label: 'Gold'     },
]

export function getDiscountTier(balanceCents: number) {
  return [...DISCOUNT_TIERS].reverse().find(t => balanceCents >= t.min * 100) ?? DISCOUNT_TIERS[0]
}

// ── Billing: create a subscription for a company ──────────────────────────
export async function createCompanySubscription(
  companyName: string,
  adminEmail: string,
  memberCount: number
) {
  // Create Stripe customer
  const customer = await stripe.customers.create({
    name: companyName,
    email: adminEmail,
    metadata: { source: 'perk' },
  })

  // Create a product + price, then attach to a subscription
  const product = await stripe.products.create({ name: 'perk. subscription' })

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: calcMonthlyPrice(memberCount),
    recurring: { interval: 'month' },
  })

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })

  return { customer, subscription }
}

// ── Treasury: create a financial account (wallet) for a company ───────────
export async function createCompanyWallet(stripeCustomerId: string) {
  // NOTE: Stripe Treasury requires application and approval
  // Docs: https://stripe.com/docs/treasury
  // Treasury feature types vary by Stripe SDK version — cast to any until approved
  const financialAccount = await stripe.treasury.financialAccounts.create({
    supported_currencies: ['usd'],
    features: {
      card_issuing: { requested: true },
      deposit_insurance: { requested: true },
      financial_addresses: { ach: { requested: true } },
      inbound_transfers: { ach: { requested: true } },
      intra_stripe_flows: { requested: true },
      outbound_payments: {
        ach: { requested: true },
        us_domestic_wire: { requested: true },
      },
      outbound_transfers: {
        ach: { requested: true },
        us_domestic_wire: { requested: true },
      },
    } as any,
  })
  return financialAccount
}

// ── Issuing: create a cardholder for a member ─────────────────────────────
export async function createCardholder(
  name: string,
  email: string,
  companyName: string
) {
  // NOTE: Stripe Issuing requires application and approval
  // Docs: https://stripe.com/docs/issuing
  const cardholder = await stripe.issuing.cardholders.create({
    name,
    email,
    status: 'active',
    type: 'individual',
    billing: {
      address: {
        // In production: collect real address during onboarding
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94105',
        country: 'US',
      },
    },
    metadata: { company: companyName },
  })
  return cardholder
}

// ── Issuing: create a virtual card for a member ───────────────────────────
export async function createVirtualCard(
  cardholderId: string,
  spendingLimitCents: number,
  allowedCategories: string[]  // Stripe MCC category strings
) {
  const card = await stripe.issuing.cards.create({
    cardholder: cardholderId,
    currency: 'usd',
    type: 'virtual',
    status: 'active',
    spending_controls: {
      spending_limits: [
        {
          amount: spendingLimitCents,
          interval: 'monthly',
        },
      ],
      // Restrict by Merchant Category Codes
      // Full list: https://stripe.com/docs/issuing/categories
      allowed_categories: allowedCategories.length > 0
        ? allowedCategories as Stripe.Issuing.CardCreateParams.SpendingControls.AllowedCategory[]
        : undefined,
    },
  })
  return card
}

// ── Issuing: update card spending limit when stipend changes ──────────────
export async function updateCardLimit(
  cardId: string,
  newLimitCents: number
) {
  return stripe.issuing.cards.update(cardId, {
    spending_controls: {
      spending_limits: [{ amount: newLimitCents, interval: 'monthly' }],
    },
  })
}

// ── Issuing: freeze/unfreeze a card ───────────────────────────────────────
export async function setCardStatus(cardId: string, active: boolean) {
  return stripe.issuing.cards.update(cardId, {
    status: active ? 'active' : 'inactive',
  })
}

// ── MCC category mapping ──────────────────────────────────────────────────
// Maps perk. categories to Stripe MCC category strings
// Full list: https://stripe.com/docs/issuing/categories
export const CATEGORY_MCC_MAP: Record<string, string[]> = {
  'Wellness':         ['health_and_beauty_spas', 'massage_parlors', 'beauty_shops'],
  'Mental Health':    ['counseling_services', 'health_practitioners_medical_services'],
  'Fitness':          ['sports_clubs_fields', 'sporting_goods_stores', 'bicycle_shops'],
  'Professional Dev': ['computer_programming_data_processing', 'schools_educational_services'],
  'Meals':            ['eating_places_restaurants', 'fast_food_restaurants', 'grocery_stores_supermarkets'],
  'Travel':           ['airlines_air_carriers', 'hotels_motels_inns_resorts', 'car_rental_agencies'],
  'Home Office':      ['computer_and_computer_peripheral_equipment', 'office_supplies_stationery'],
  'Childcare':        ['child_care_services', 'schools_educational_services'],
}

export function categoriesToMCCs(categories: string[]): string[] {
  return [...new Set(categories.flatMap(c => CATEGORY_MCC_MAP[c] ?? []))]
}

// ── Plan definitions (must match PerkApp.jsx PLANS) ──────────────────────
export const PLAN_CONFIG: Record<string, { priceCents: number; maxMembers: number; name: string }> = {
  starter: { priceCents: 1900,  maxMembers: 3,  name: 'Starter' },
  growth:  { priceCents: 4900,  maxMembers: 10, name: 'Growth'  },
  scale:   { priceCents: 9900,  maxMembers: 25, name: 'Scale'   },
}

// ── Stripe Price IDs (created once, never duplicated) ────────────────────
const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth:  process.env.STRIPE_PRICE_GROWTH!,
  scale:   process.env.STRIPE_PRICE_SCALE!,
}

export function getPlanPriceId(planId: string): string {
  const priceId = PLAN_PRICE_IDS[planId]
  if (!priceId) throw new Error(`Unknown plan or missing price env var: ${planId}`)
  return priceId
}

// ── Create Stripe Checkout Session ───────────────────────────────────────
export async function createCheckoutSession(opts: {
  planId: string
  name: string
  email: string
  passwordHash: string
  teamSize: number
}): Promise<Stripe.Checkout.Session> {
  const priceId = getPlanPriceId(opts.planId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'

  const config = PLAN_CONFIG[opts.planId]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ui_mode: 'embedded',
    customer_email: opts.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    custom_text: {
      submit: {
        message: `${config.name} plan — up to ${config.maxMembers} team members with virtual cards, spending controls, and year-end tax reporting. Cancel anytime.`,
      },
    },
    return_url: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      perk_signup: 'true',
      company_name: opts.name,
      admin_email: opts.email,
      admin_password_hash: opts.passwordHash,
      plan: opts.planId,
      team_size: String(opts.teamSize),
    },
    subscription_data: {
      description: `perk. ${config.name} — benefits platform for up to ${config.maxMembers} team members`,
      metadata: {
        perk_plan: opts.planId,
        company_name: opts.name,
      },
    },
  })

  return session
}

// ── Provision company from a completed checkout session ──────────────────
export async function provisionCompanyFromSession(sessionId: string, sql: any): Promise<any> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  })

  if (session.payment_status !== 'paid') {
    throw new Error('Session not paid')
  }

  const meta = session.metadata
  if (!meta?.perk_signup) {
    throw new Error('Not a perk signup session')
  }

  const customerId = session.customer as string
  const subscription = session.subscription as Stripe.Subscription

  // Upsert: only create if not already created (handles race between webhook and success page)
  const [existing] = await sql`
    SELECT id FROM companies WHERE stripe_customer_id = ${customerId}
  `

  if (existing) {
    const [company] = await sql`
      SELECT id, name, admin_email, plan, max_members, stripe_customer_id, stripe_subscription_id
      FROM companies WHERE id = ${existing.id}
    `
    return company
  }

  const [company] = await sql`
    INSERT INTO companies (
      name, admin_email, admin_password_hash,
      stripe_customer_id, stripe_subscription_id,
      plan, max_members
    ) VALUES (
      ${meta.company_name}, ${meta.admin_email}, ${meta.admin_password_hash},
      ${customerId}, ${subscription.id},
      ${meta.plan || 'starter'}, ${parseInt(meta.team_size || '3', 10)}
    )
    ON CONFLICT (stripe_customer_id) DO NOTHING
    RETURNING *
  `

  // If ON CONFLICT hit, fetch the existing row
  if (!company) {
    const [existing2] = await sql`
      SELECT id, name, admin_email, plan, max_members, stripe_customer_id, stripe_subscription_id
      FROM companies WHERE stripe_customer_id = ${customerId}
    `
    return existing2
  }

  return company
}

// ── Webhook: verify Stripe signature ─────────────────────────────────────
export function constructWebhookEvent(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
