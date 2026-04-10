import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/transactions?company_id=xxx
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const companyId = req.nextUrl.searchParams.get('company_id')
  const memberId = req.nextUrl.searchParams.get('member_id')

  let query = supabase
    .from('transactions')
    .select('*, members(name, employment_type)')
    .order('created_at', { ascending: false })

  if (companyId) query = query.eq('company_id', companyId)
  if (memberId) query = query.eq('member_id', memberId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/transactions — approve or reject a transaction
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, rejection_note } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('transactions')
      .update({ status, rejection_note: rejection_note ?? null })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If approved, deduct from member balance
    if (status === 'approved' && data) {
      await supabase.rpc('deduct_member_balance', {
        p_member_id: data.member_id,
        p_amount: data.amount,
      })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
