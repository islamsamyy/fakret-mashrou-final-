import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInvestmentSchema, parseWithErrorMessage } from '@/lib/schemas'
import { limiterInvest, checkRateLimit } from '@/lib/rate-limit'
import { getClientIpForRateLimit } from '@/lib/api/helpers'
import { successResponse, errorResponse } from '@/lib/api/response'
import { TooManyRequests, Unauthorized, InternalServerError } from '@/lib/api/errors'
import { createInvestment } from '@/lib/services/investment'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('investments')
    .select(`
      id, amount, status, created_at, notes,
      project:projects ( id, title, description, category, funding_goal, amount_raised, status )
    `)
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[invest GET]', error)
    return NextResponse.json({ error: 'فشل في جلب الاستثمارات' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Unauthorized()
    }

    // Rate limit
    const ip = getClientIpForRateLimit(request)
    const identifier = `${user.id}:${ip}`
    const rateLimitCheck = await checkRateLimit(limiterInvest, identifier)
    if (!rateLimitCheck.success) {
      throw new TooManyRequests(
        rateLimitCheck.message || 'تم تجاوز الحد المسموح'
      )
    }

    // Parse input
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new Error('صيغة الطلب غير صحيحة')
    }

    const parseResult = parseWithErrorMessage(createInvestmentSchema, body)
    if (!parseResult.success) {
      throw new Error(parseResult.message)
    }

    // Create investment via service
    const investment = await createInvestment(
      { supabase, userId: user.id },
      parseResult.data
    )

    return successResponse(
      {
        investmentId: investment.id,
        projectId: investment.project_id,
        amount: investment.amount,
        status: investment.status,
      },
      201
    )
  } catch (err) {
    console.error('[invest POST]', err)
    if (err instanceof Error && 'statusCode' in err) {
      return errorResponse(err as any)
    }
    return errorResponse(new InternalServerError())
  }
}
