import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/transactions?company_id=xxx
export async function GET(req: NextRequest) {
  const sql = getDb()
  const companyId = req.nextUrl.searchParams.get('company_id')
  const memberId = req.nextUrl.searchParams.get('member_id')

  let data
  if (companyId && memberId) {
    data = await sql`
      SELECT t.*, m.name as member_name, m.employment_type
      FROM transactions t JOIN members m ON t.member_id = m.id
      WHERE t.company_id = ${companyId} AND t.member_id = ${memberId}
      ORDER BY t.created_at DESC
    `
  } else if (companyId) {
    data = await sql`
      SELECT t.*, m.name as member_name, m.employment_type
      FROM transactions t JOIN members m ON t.member_id = m.id
      WHERE t.company_id = ${companyId}
      ORDER BY t.created_at DESC
    `
  } else if (memberId) {
    data = await sql`
      SELECT t.*, m.name as member_name, m.employment_type
      FROM transactions t JOIN members m ON t.member_id = m.id
      WHERE t.member_id = ${memberId}
      ORDER BY t.created_at DESC
    `
  } else {
    data = await sql`
      SELECT t.*, m.name as member_name, m.employment_type
      FROM transactions t JOIN members m ON t.member_id = m.id
      ORDER BY t.created_at DESC
    `
  }

  return NextResponse.json(data)
}

// PATCH /api/transactions — approve or reject a transaction
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, rejection_note } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const sql = getDb()

    const [updated] = await sql`
      UPDATE transactions SET status = ${status}, rejection_note = ${rejection_note ?? null}
      WHERE id = ${id}
      RETURNING *
    `

    if (!updated) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    // If approved, deduct from member balance
    if (status === 'approved') {
      await sql`
        UPDATE members SET balance = balance - ${updated.amount}
        WHERE id = ${updated.member_id}
      `
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
