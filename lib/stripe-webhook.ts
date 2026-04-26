import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

/**
 * Check if webhook event was already processed
 * Returns true if already seen, false if new
 */
export async function isWebhookEventProcessed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle()

  return !!data
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookEventProcessed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  eventType: string,
  eventTimestamp: number
): Promise<void> {
  await supabase.from('stripe_webhook_events').insert({
    id: eventId,
    event_type: eventType,
    event_timestamp: eventTimestamp,
    idempotency_key: `${eventId}_${eventTimestamp}`,
  })
}

/**
 * Update investment status and project amount_raised in a single transaction
 */
export async function confirmInvestmentPayment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  investmentId: string,
  investorId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Postgres RPC to ensure atomicity
    const { data, error } = await supabase.rpc('confirm_investment', {
      p_investment_id: investmentId,
      p_investor_id: investorId,
      p_amount: amount,
    })

    if (error) {
      console.error('[confirmInvestmentPayment] RPC error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[confirmInvestmentPayment] Exception:', err)
    return { success: false, error: 'Database error' }
  }
}
