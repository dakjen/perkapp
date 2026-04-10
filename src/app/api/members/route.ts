import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import {
  createCardholder,
  createVirtualCard,
  categoriesToMCCs,
} from '@/lib/stripe'

// GET /api/members?company_id=xxx  — list all members for a company
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const companyId = req.nextUrl.searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/members — add a member and issue them a card
export async function POST(req: NextRequest) {
  try {
    const {
      company_id,
      name,
      email,
      employment_type,
      stipend_amount,
      stipend_frequency,
      categories,
    } = await req.json()

    const supabase = createAdminClient()

    // 1. Get company info (need name and Stripe IDs)
    const { data: company, error: coError } = await supabase
      .from('companies')
      .select('name, stripe_treasury_account_id')
      .eq('id', company_id)
      .single()

    if (coError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // 2. Create the member record first (no user_id yet — they haven't accepted invite)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        company_id,
        name,
        email,
        employment_type,
        stipend_amount,
        stipend_frequency,
        balance: stipend_amount,
        card_limit: stipend_amount,
        categories,
      })
      .select()
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message }, { status: 500 })
    }

    // 3. Create Stripe cardholder
    // NOTE: Requires Stripe Issuing approval
    // Comment out and set dummy IDs for dev until approved
    try {
      const cardholder = await createCardholder(name, email, company.name)
      const mccs = categoriesToMCCs(categories)
      const card = await createVirtualCard(
        cardholder.id,
        Math.round(stipend_amount * 100),  // convert to cents
        mccs
      )

      // Update member with Stripe card IDs
      await supabase
        .from('members')
        .update({
          stripe_cardholder_id: cardholder.id,
          stripe_card_id: card.id,
        })
        .eq('id', member.id)
    } catch (stripeErr: any) {
      console.warn('Stripe card creation skipped (Issuing not yet active):', stripeErr.message)
      // Member is still created — card will be issued when Stripe Issuing is approved
    }

    // 4. Create invitation token
    const { data: invite, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        company_id,
        member_id: member.id,
        email,
      })
      .select()
      .single()

    if (inviteError) console.error('Invite creation error:', inviteError)

    // 5. Send invite email via Supabase
    // In production: use Supabase's email or your own (Resend, SendGrid, etc.)
    // The invite link would be: ${APP_URL}/accept-invite?token=${invite.token}
    // For now we return the token so you can test manually
    console.log(`Invite link: ${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invite?.token}`)

    return NextResponse.json({ member, inviteToken: invite?.token }, { status: 201 })
  } catch (err: any) {
    console.error('Create member error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
