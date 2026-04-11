import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, provisionCompanyFromSession } from '@/lib/stripe'
import { getDb } from '@/lib/db'

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

  const sql = getDb()

  try {
    switch (event.type) {

      // Checkout session completed — provision company after payment
      case 'checkout.session.completed': {
        const session = event.data.object as any
        if (session.metadata?.perk_signup === 'true') {
          try {
            await provisionCompanyFromSession(session.id, sql)
            console.log('Company provisioned from webhook for session:', session.id)
          } catch (err: any) {
            console.error('Failed to provision company from webhook:', err.message)
          }
        }
        break
      }

      // Card swipe: create a pending transaction
      case 'issuing_authorization.created': {
        const auth = event.data.object as any

        const [member] = await sql`
          SELECT id, company_id, balance, card_limit FROM members
          WHERE stripe_card_id = ${auth.card.id}
        `

        if (!member) {
          console.error('Member not found for card:', auth.card.id)
          break
        }

        await sql`
          INSERT INTO transactions (company_id, member_id, amount, merchant, category, status, stripe_authorization_id, transaction_date)
          VALUES (${member.company_id}, ${member.id}, ${auth.amount / 100}, ${auth.merchant_data?.name ?? 'Unknown merchant'}, ${auth.merchant_data?.category ?? null}, 'pending', ${auth.id}, ${new Date().toISOString().split('T')[0]})
        `
        break
      }

      // Transaction settled
      case 'issuing_transaction.created': {
        const tx = event.data.object as any

        await sql`
          UPDATE transactions SET stripe_transaction_id = ${tx.id}
          WHERE stripe_authorization_id = ${tx.authorization}
        `
        break
      }

      // Subscription updated
      case 'customer.subscription.updated': {
        const sub = event.data.object as any

        await sql`
          UPDATE companies SET stripe_subscription_id = ${sub.id}
          WHERE stripe_customer_id = ${sub.customer}
        `
        break
      }

      // Payment succeeded
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        console.log('Payment succeeded for customer:', invoice.customer, 'Amount:', invoice.amount_paid / 100)
        break
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        console.error('Payment failed for customer:', invoice.customer)
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
