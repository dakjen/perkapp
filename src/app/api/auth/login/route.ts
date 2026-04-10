import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sql = getDb()

    if (role === 'admin') {
      const [company] = await sql`
        SELECT id, name, admin_email, admin_password_hash, brand_color, account_balance,
               stripe_customer_id, stripe_subscription_id, plan
        FROM companies WHERE admin_email = ${email}
      `

      if (!company) {
        return NextResponse.json({ error: 'No account found with those credentials' }, { status: 401 })
      }

      const valid = await compare(password, company.admin_password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'No account found with those credentials' }, { status: 401 })
      }

      const { admin_password_hash, ...safeCompany } = company
      return NextResponse.json({ role: 'admin', company: safeCompany })
    }

    if (role === 'employee') {
      const [member] = await sql`
        SELECT m.id, m.company_id, m.name, m.email, m.password_hash
        FROM members m WHERE m.email = ${email}
      `

      if (!member || !member.password_hash) {
        return NextResponse.json({ error: 'No account found with those credentials' }, { status: 401 })
      }

      const valid = await compare(password, member.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'No account found with those credentials' }, { status: 401 })
      }

      return NextResponse.json({ role: 'employee', memberId: member.id, companyId: member.company_id })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
