import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { getDb } from '@/lib/db'
import {
  createCardholder,
  createVirtualCard,
  categoriesToMCCs,
} from '@/lib/stripe'

// GET /api/members?company_id=xxx
export async function GET(req: NextRequest) {
  const sql = getDb()
  const companyId = req.nextUrl.searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 })

  const data = await sql`
    SELECT * FROM members
    WHERE company_id = ${companyId}
    ORDER BY created_at ASC
  `

  return NextResponse.json(data)
}

// POST /api/members — add a member and issue them a card
export async function POST(req: NextRequest) {
  try {
    const {
      company_id,
      name,
      email,
      password,
      employment_type,
      stipend_amount,
      stipend_frequency,
      categories,
    } = await req.json()

    const sql = getDb()
    const passwordHash = password ? await hash(password, 12) : null

    // 1. Get company info
    const [company] = await sql`
      SELECT name, stripe_treasury_account_id FROM companies WHERE id = ${company_id}
    `

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // 2. Create the member record
    const [member] = await sql`
      INSERT INTO members (company_id, name, email, password_hash, employment_type, stipend_amount, stipend_frequency, balance, card_limit, categories)
      VALUES (${company_id}, ${name}, ${email}, ${passwordHash}, ${employment_type}, ${stipend_amount}, ${stipend_frequency}, ${stipend_amount}, ${stipend_amount}, ${categories})
      RETURNING *
    `

    // 3. Create Stripe cardholder + card (requires Issuing approval)
    try {
      const cardholder = await createCardholder(name, email, company.name)
      const mccs = categoriesToMCCs(categories)
      const card = await createVirtualCard(
        cardholder.id,
        Math.round(stipend_amount * 100),
        mccs
      )

      await sql`
        UPDATE members SET stripe_cardholder_id = ${cardholder.id}, stripe_card_id = ${card.id}
        WHERE id = ${member.id}
      `
    } catch (stripeErr: any) {
      console.warn('Stripe card creation skipped (Issuing not yet active):', stripeErr.message)
    }

    // 4. Create invitation token
    const [invite] = await sql`
      INSERT INTO invitations (company_id, member_id, email)
      VALUES (${company_id}, ${member.id}, ${email})
      RETURNING *
    `

    console.log(`Invite link: ${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invite?.token}`)

    return NextResponse.json({ member, inviteToken: invite?.token }, { status: 201 })
  } catch (err: any) {
    console.error('Create member error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
