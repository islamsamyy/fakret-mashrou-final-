import type { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeUrl } from '@/lib/sanitize-security'
import type { CreateProjectInput } from '@/lib/schemas'
import {
  Forbidden,
  InternalServerError,
  BadRequest,
} from '@/lib/api/errors'

/**
 * Business logic for project operations
 */

interface ProjectContext {
  supabase: SupabaseClient
  userId: string
}

export async function validateUserKycStatus(
  context: ProjectContext
): Promise<boolean> {
  const { supabase, userId } = context

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Forbidden('لم نتمكن من التحقق من حسابك')
  }

  if (profile.kyc_status !== 'verified') {
    throw new Forbidden(
      'يجب التحقق من هويتك أولاً قبل إنشاء مشروع'
    )
  }

  return true
}

export async function createProject(
  context: ProjectContext,
  input: CreateProjectInput
): Promise<{ id: string; title: string; category: string; status: string }> {
  const { supabase, userId } = context

  // Check KYC
  await validateUserKycStatus(context)

  // Sanitize URLs
  const sanitizedImage = sanitizeUrl(input.image)
  const sanitizedVideoUrl = sanitizeUrl(input.videoUrl)

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: input.title,
      category: input.category,
      description: input.description,
      funding_goal: input.fundingGoal,
      amount_raised: 0,
      status: 'draft',
      founder_id: userId,
      img: sanitizedImage,
      video_url: sanitizedVideoUrl,
    })
    .select('id, title, category, funding_goal, status')
    .single()

  if (error) {
    console.error('[createProject]', error)
    throw new InternalServerError('فشل إنشاء المشروع')
  }

  return project
}

export async function getProjectsForMatching(
  context: ProjectContext,
  limit = 100
): Promise<any[]> {
  const { supabase } = context

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, title, description, category, funding_goal, amount_raised, verified, img, video_url, founder_id, status, created_at, min_invest, roi'
    )
    .eq('status', 'active')
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getProjectsForMatching]', error)
    return []
  }

  return data ?? []
}
