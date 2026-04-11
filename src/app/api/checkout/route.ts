import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { createCheckoutSession, provisionCompanyFromSession, PLAN_CONFIG } from '@/lib/stripe'
import { getDb } from '@/lib/db'

// POST /api/checkout — create a Stripe Checkout Session for signup
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan, team_size } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Hash password before storing in metadata
    const passwordHash = await hash(password, 12)

    const session = await createCheckoutSession({
      planId: plan,
      name,
      email,
      passwordHash,
      teamSize: team_size || PLAN_CONFIG[plan].maxMembers,
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err: any) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

// GET /api/checkout?session_id=xxx — verify checkout and provision company
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const sql = getDb()
    const company = await provisionCompanyFromSession(sessionId, sql)

    return NextResponse.json({ company })
  } catch (err: any) {
    console.error('Checkout verification error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
