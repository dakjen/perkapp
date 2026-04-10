import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
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

// ── Webhook: verify Stripe signature ─────────────────────────────────────
export function constructWebhookEvent(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
