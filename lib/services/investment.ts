import type { SupabaseClient } from '@supabase/supabase-js'
import { confirmInvestmentPayment } from '@/lib/stripe-webhook'
import type { CreateInvestmentInput } from '@/lib/schemas'
import {
  BadRequest,
  Conflict,
  NotFound,
  Forbidden,
  InternalServerError,
} from '@/lib/api/errors'

/**
 * Business logic for investment operations
 * Decoupled from HTTP routing for testability
 */

interface InvestmentContext {
  supabase: SupabaseClient
  userId: string
}

export async function validateInvestmentEligibility(
  context: InvestmentContext,
  projectId: string
): Promise<{ id: string; founder_id: string; status: string }> {
  const { supabase, userId } = context

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, founder_id, status')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    throw new NotFound('المشروع غير موجود')
  }

  if (project.founder_id === userId) {
    throw new Forbidden('لا يمكنك الاستثمار في مشروعك الخاص')
  }

  if (project.status !== 'active') {
    throw new Conflict('هذا المشروع لا يقبل استثمارات جديدة')
  }

  return project
}

export async function checkDuplicateInvestment(
  context: InvestmentContext,
  projectId: string
): Promise<boolean> {
  const { supabase, userId } = context

  const { data: existing } = await supabase
    .from('investments')
    .select('id')
    .eq('project_id', projectId)
    .eq('investor_id', userId)
    .maybeSingle()

  return !!existing
}

export async function createInvestment(
  context: InvestmentContext,
  input: CreateInvestmentInput
): Promise<{
  id: string
  project_id: string
  amount: number
  status: string
}> {
  const { supabase, userId } = context

  // Validate eligibility
  await validateInvestmentEligibility(context, input.projectId)

  // Check for duplicate
  const isDuplicate = await checkDuplicateInvestment(context, input.projectId)
  if (isDuplicate) {
    throw new Conflict('أنت بالفعل مستثمر في هذا المشروع')
  }

  // Insert investment
  const { data: investment, error: insertError } = await supabase
    .from('investments')
    .insert({
      project_id: input.projectId,
      investor_id: userId,
      amount: input.amount,
      status: 'committed',
      notes: input.notes || null,
    })
    .select('id, project_id, amount, status')
    .single()

  if (insertError) {
    const isConflict =
      insertError.code === '23505' ||
      insertError.message?.includes('unique_investor_per_project')

    if (isConflict) {
      throw new Conflict('أنت بالفعل مستثمر في هذا المشروع')
    }

    console.error('[createInvestment]', insertError)
    throw new InternalServerError('فشل إنشاء الاستثمار')
  }

  if (!investment) {
    throw new InternalServerError('فشل إنشاء الاستثمار')
  }

  return investment
}

export async function getInvestorInvestments(
  context: InvestmentContext,
  limit = 50,
  offset = 0
): Promise<any[]> {
  const { supabase, userId } = context

  const { data, error } = await supabase
    .from('investments')
    .select(`
      id, amount, status, created_at, notes,
      project:projects ( id, title, description, category, funding_goal, amount_raised, status )
    `)
    .eq('investor_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getInvestorInvestments]', error)
    throw new InternalServerError('فشل في جلب الاستثمارات')
  }

  return data ?? []
}
