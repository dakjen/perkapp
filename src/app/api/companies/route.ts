import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { getDb } from '@/lib/db'
import { createCompanySubscription, createCompanyWallet } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sql = getDb()
    const passwordHash = await hash(password, 12)

    // 1. Create Stripe customer + subscription
    const { customer, subscription } = await createCompanySubscription(name, email, 0)

    // 2. Create Stripe Treasury financial account (wallet)
    let walletId = null
    try {
      const wallet = await createCompanyWallet(customer.id)
      walletId = wallet.id
    } catch (err: any) {
      console.warn('Treasury wallet skipped (not yet approved):', err.message)
    }

    // 3. Create the company record
    const [company] = await sql`
      INSERT INTO companies (name, admin_email, admin_password_hash, stripe_customer_id, stripe_subscription_id, stripe_treasury_account_id)
      VALUES (${name}, ${email}, ${passwordHash}, ${customer.id}, ${subscription.id}, ${walletId})
      RETURNING *
    `

    return NextResponse.json({ company }, { status: 201 })
  } catch (err: any) {
    console.error('Create company error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
