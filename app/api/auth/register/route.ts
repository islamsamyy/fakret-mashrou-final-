import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupSchema, parseWithErrorMessage } from '@/lib/schemas'
import { limiterAuth, checkRateLimit } from '@/lib/rate-limit'
import { getClientIpForRateLimit } from '@/lib/api/helpers'

const VALID_ROLES = ['investor', 'founder'] as const
type Role = typeof VALID_ROLES[number]

export async function POST(req: NextRequest) {
  // Rate limit by IP address
  const ip = getClientIpForRateLimit(req)
  const rateLimitCheck = await checkRateLimit(limiterAuth, ip)
  if (!rateLimitCheck.success) {
    return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  // Parse with Zod
  const bodyRecord = (body as Record<string, unknown>) || {}
  const parseResult = parseWithErrorMessage(signupSchema, {
    email: bodyRecord.email,
    password: bodyRecord.password,
    fullName: bodyRecord.fullName || bodyRecord.name,
    role: bodyRecord.role || 'investor',
  })

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.message }, { status: 400 })
  }

  const { email, password, fullName, role } = parseResult.data

  const supabase = await createClient()

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (signupError) {
    const msg = signupError.message
    if (
      msg.includes('rate limit') ||
      msg.includes('too many') ||
      msg.includes('Too many')
    ) {
      return NextResponse.json(
        { error: 'محاولات كثيرة. يرجى المحاولة بعد قليل' },
        { status: 429 }
      )
    }
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل بالفعل' },
        { status: 409 }
      )
    }
    console.error('[register POST] signUp error:', msg)
    return NextResponse.json(
      { error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }

  if (!signupData?.user?.id) {
    return NextResponse.json(
      { error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }

  const userId = signupData.user.id

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    role,
  })

  if (profileError) {
    console.error('[register POST] profile insert error:', profileError)
  }

  return NextResponse.json(
    { data: { user: { id: userId, email: signupData.user.email ?? '' } } },
    { status: 201 }
  )
}
