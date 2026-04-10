import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const sql = getDb()
  const companyId = req.nextUrl.searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 })

  const data = await sql`
    SELECT * FROM perks WHERE company_id = ${companyId} ORDER BY display_order ASC, created_at ASC
  `
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const { company_id, icon_id, title, description, company_paid, cost_per_person, frequency, taxable } = await req.json()
    const sql = getDb()

    const [perk] = await sql`
      INSERT INTO perks (company_id, icon_id, title, description, company_paid, cost_per_person, frequency, taxable)
      VALUES (${company_id}, ${icon_id || 'heart'}, ${title}, ${description || null}, ${company_paid || false}, ${cost_per_person || null}, ${frequency || null}, ${taxable || false})
      RETURNING *
    `
    return NextResponse.json(perk, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, icon_id, title, description, company_paid, cost_per_person, frequency, taxable } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const sql = getDb()
    const [perk] = await sql`
      UPDATE perks SET
        icon_id = ${icon_id || 'heart'},
        title = ${title},
        description = ${description || null},
        company_paid = ${company_paid || false},
        cost_per_person = ${cost_per_person || null},
        frequency = ${frequency || null},
        taxable = ${taxable || false}
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(perk)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const sql = getDb()
    await sql`DELETE FROM perks WHERE id = ${id}`
    return NextResponse.json({ deleted: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
