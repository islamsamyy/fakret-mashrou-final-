import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema, parseWithErrorMessage } from '@/lib/schemas'
import { successResponse, errorResponse } from '@/lib/api/response'
import { Unauthorized, InternalServerError } from '@/lib/api/errors'
import { createProject } from '@/lib/services/project'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Unauthorized()
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new Error('صيغة الطلب غير صحيحة')
    }

    const parseResult = parseWithErrorMessage(createProjectSchema, {
      title: (body as Record<string, unknown>).title,
      description: (body as Record<string, unknown>).description,
      category: (body as Record<string, unknown>).category,
      fundingGoal: (body as Record<string, unknown>).fundingGoal,
      image: (body as Record<string, unknown>).image,
      videoUrl: (body as Record<string, unknown>).videoUrl,
    })

    if (!parseResult.success) {
      throw new Error(parseResult.message)
    }

    const project = await createProject(
      { supabase, userId: user.id },
      parseResult.data
    )

    return successResponse({ project }, 201)
  } catch (err) {
    console.error('[projects/create POST]', err)
    if (err instanceof Error && 'statusCode' in err) {
      return errorResponse(err as any)
    }
    return errorResponse(new InternalServerError())
  }
}
