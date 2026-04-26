import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInvestmentSchema, parseWithErrorMessage } from '@/lib/schemas'
import { limiterInvest, checkRateLimit } from '@/lib/rate-limit'
import { getClientIpForRateLimit } from '@/lib/api/helpers'

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
  // Rate limit by user ID + IP (user must be logged in)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  const ip = getClientIpForRateLimit(request)
  const identifier = `${user.id}:${ip}` // Combine user + IP for stricter limiting
  const rateLimitCheck = await checkRateLimit(limiterInvest, identifier)
  if (!rateLimitCheck.success) {
    return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  // Parse with Zod
  const parseResult = parseWithErrorMessage(createInvestmentSchema, body)
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.message }, { status: 400 })
  }

  const { projectId, amount, notes } = parseResult.data

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, founder_id, status')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 })
  }

  if (project.founder_id === user.id) {
    return NextResponse.json(
      { error: 'لا يمكنك الاستثمار في مشروعك الخاص' },
      { status: 403 }
    )
  }

  if (project.status !== 'active') {
    return NextResponse.json(
      { error: 'هذا المشروع لا يقبل استثمارات جديدة' },
      { status: 409 }
    )
  }

  const { data: existing } = await supabase
    .from('investments')
    .select('id')
    .eq('project_id', projectId)
    .eq('investor_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'أنت بالفعل مستثمر في هذا المشروع' },
      { status: 409 }
    )
  }

  const { data: investment, error: insertError } = await supabase
    .from('investments')
    .insert({
      project_id: projectId,
      investor_id: user.id,
      amount,
      status: 'committed', // Match Investment.status type
      notes: notes || null,
    })
    .select('id, project_id, amount, status')
    .single()

  if (insertError || !investment) {
    console.error('[invest POST]', insertError)
    return NextResponse.json({ error: 'فشل إنشاء الاستثمار' }, { status: 500 })
  }

  return NextResponse.json(
    {
      data: {
        investmentId: investment.id,
        projectId: investment.project_id,
        amount: investment.amount,
        status: investment.status,
      },
    },
    { status: 201 }
  )
}
