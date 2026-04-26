import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema, parseWithErrorMessage } from '@/lib/schemas'
import { sanitizeUrl } from '@/lib/sanitize-security'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  // Parse with Zod (includes URL validation)
  const parseResult = parseWithErrorMessage(createProjectSchema, {
    title: (body as Record<string, unknown>).title,
    description: (body as Record<string, unknown>).description,
    category: (body as Record<string, unknown>).category,
    fundingGoal: (body as Record<string, unknown>).fundingGoal,
    image: (body as Record<string, unknown>).image,
    videoUrl: (body as Record<string, unknown>).videoUrl,
  })

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.message }, { status: 400 })
  }

  const { title, description, category, fundingGoal, image, videoUrl } =
    parseResult.data

  // Double-check URL sanitization
  const sanitizedImage = sanitizeUrl(image)
  const sanitizedVideoUrl = sanitizeUrl(videoUrl)

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', user.id)
    .single()

  if (profile?.kyc_status !== 'verified') {
    return NextResponse.json(
      { error: 'يجب التحقق من هويتك أولاً قبل إنشاء مشروع' },
      { status: 403 }
    )
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title,
      category,
      description,
      funding_goal: fundingGoal,
      amount_raised: 0,
      status: 'draft',
      founder_id: user.id,
      img: sanitizedImage,
      video_url: sanitizedVideoUrl,
    })
    .select('id, title, category, funding_goal, status')
    .single()

  if (error) {
    console.error('[projects/create]', error)
    return NextResponse.json({ error: 'فشل إنشاء المشروع' }, { status: 500 })
  }

  return NextResponse.json({ data: project }, { status: 201 })
}
