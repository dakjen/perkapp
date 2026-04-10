import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

// This endpoint receives real-time events from Stripe.
// Set your webhook URL in Stripe dashboard to: https://yourdomain.com/api/stripe/webhook
// Events to enable:
//   - issuing_authorization.created   (card swipe — pending approval)
//   - issuing_authorization.updated   (authorization updated)
//   - issuing_transaction.created     (transaction settled)
//   - customer.subscription.updated   (plan changes)
//   - invoice.payment_succeeded       (successful billing)
//   - invoice.payment_failed          (failed billing)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {

      // ── Card swipe: create a pending transaction ──────────────────────
      case 'issuing_authorization.created': {
        const auth = event.data.object as any

        // Look up the member by their Stripe card ID
        const { data: member } = await supabase
          .from('members')
          .select('id, company_id, balance, card_limit')
          .eq('stripe_card_id', auth.card.id)
          .single()

        if (!member) {
          console.error('Member not found for card:', auth.card.id)
          break
        }

        // Create a pending transaction — admin will approve/reject in app
        await supabase.from('transactions').insert({
          company_id: member.company_id,
          member_id: member.id,
          amount: auth.amount / 100,  // convert cents to dollars
          merchant: auth.merchant_data?.name ?? 'Unknown merchant',
          category: auth.merchant_data?.category ?? null,
          status: 'pending',
          stripe_authorization_id: auth.id,
          transaction_date: new Date().toISOString().split('T')[0],
        })

        // NOTE: In production you'd also call stripe.issuing.authorizations.approve()
        // or .decline() here based on your business logic.
        // For perk., the flow is: auto-approve if in-category, flag for review otherwise.
        break
      }

      // ── Transaction settled ───────────────────────────────────────────
      case 'issuing_transaction.created': {
        const tx = event.data.object as any

        // Update the transaction with the settled Stripe transaction ID
        await supabase
          .from('transactions')
          .update({ stripe_transaction_id: tx.id })
          .eq('stripe_authorization_id', tx.authorization)

        break
      }

      // ── Subscription updated (team size changed, etc.) ─────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as any

        await supabase
          .from('companies')
          .update({ stripe_subscription_id: sub.id })
          .eq('stripe_customer_id', sub.customer)

        break
      }

      // ── Payment succeeded ─────────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        console.log('Payment succeeded for customer:', invoice.customer, 'Amount:', invoice.amount_paid / 100)
        // In production: update subscription status, send receipt email
        break
      }

      // ── Payment failed ────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        console.error('Payment failed for customer:', invoice.customer)
        // In production: send dunning email, pause cards after grace period
        break
      }

      default:
        console.log('Unhandled webhook event:', event.type)
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Required: disable Next.js body parsing so we get the raw body for signature verification
export const config = {
  api: { bodyParser: false },
}
