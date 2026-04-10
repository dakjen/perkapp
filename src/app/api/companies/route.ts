import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createCompanySubscription } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sql = getDb()

    // 1. Create Stripe customer + subscription
    const { customer, subscription } = await createCompanySubscription(name, email, 0)

    // 2. Create the company record
    const [company] = await sql`
      INSERT INTO companies (name, admin_email, admin_password_hash, stripe_customer_id, stripe_subscription_id)
      VALUES (${name}, ${email}, ${password}, ${customer.id}, ${subscription.id})
      RETURNING *
    `

    return NextResponse.json({ company }, { status: 201 })
  } catch (err: any) {
    console.error('Create company error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
