import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createCompanySubscription, createCompanyWallet } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Create the admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // auto-confirm for now; use email verification in production
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Failed to create user' }, { status: 400 })
    }

    // 2. Create Stripe customer + subscription
    const { customer, subscription } = await createCompanySubscription(name, email, 0)

    // 3. Create Stripe Treasury financial account (wallet)
    // NOTE: Comment this out until Stripe Treasury is approved for your account
    // const wallet = await createCompanyWallet(customer.id)

    // 4. Create the company record in Supabase
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        admin_user_id: authData.user.id,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        // stripe_treasury_account_id: wallet.id,  // uncomment when Treasury is active
      })
      .select()
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: companyError?.message ?? 'Failed to create company' }, { status: 500 })
    }

    return NextResponse.json({ company, userId: authData.user.id }, { status: 201 })
  } catch (err: any) {
    console.error('Create company error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
