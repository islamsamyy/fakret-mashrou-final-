import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import {
  isWebhookEventProcessed,
  markWebhookEventProcessed,
  confirmInvestmentPayment,
} from '@/lib/stripe-webhook'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    })
  }

  const supabase = await createClient()

  // Check idempotency: has this event been processed?
  const alreadyProcessed = await isWebhookEventProcessed(supabase, event.id)
  if (alreadyProcessed) {
    console.info('[stripe webhook] Event already processed, skipping:', event.id)
    return new Response('OK', { status: 200 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { investment_id, investor_id, project_id } = session.metadata ?? {}

      if (!investment_id || !investor_id || !project_id) {
        console.warn('[stripe webhook] Missing metadata:', { investment_id, investor_id, project_id })
        return new Response('Missing metadata', { status: 400 })
      }

      // Get the amount from the session
      const amountCents = session.amount_total ?? 0
      const amount = amountCents / 100 // Convert cents to main units

      // Confirm payment and update amount_raised atomically
      const confirmResult = await confirmInvestmentPayment(
        supabase,
        investment_id,
        investor_id,
        amount
      )

      if (!confirmResult.success) {
        console.error('[stripe webhook] Failed to confirm investment:', confirmResult.error)
        return new Response('Database error', { status: 500 })
      }

      // Send notification (non-critical, fail gracefully)
      try {
        await createNotification(
          investor_id,
          'investment',
          'تم تأكيد استثمارك',
          'تمت معالجة دفعتك بنجاح وتم تأكيد استثمارك.',
          '/portfolio'
        )
      } catch (notifyErr) {
        console.warn('[stripe webhook] Notification failed:', notifyErr)
      }
    }

    // Mark event as processed (after successful handling)
    await markWebhookEventProcessed(
      supabase,
      event.id,
      event.type,
      event.created
    )

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('[stripe webhook] Unhandled error:', err)
    // Don't mark as processed if there was an error; let Stripe retry
    return new Response('Internal error', { status: 500 })
  }
}
