import { z } from 'zod'

const VALID_CATEGORIES = [
  'fintech',
  'realestate',
  'ai',
  'health',
  'energy',
  'cybersecurity',
  'ecommerce',
  'logistics',
] as const

const titleSchema = z
  .string()
  .min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل')
  .max(200, 'العنوان لا يمكن أن يتجاوز 200 حرف')
  .transform(s => s.trim())

const descriptionSchema = z
  .string()
  .min(20, 'يجب أن تكون الوصفة 20 حرفاً على الأقل')
  .max(5000, 'الوصفة طويلة جداً (أقصى 5000 حرف)')
  .transform(s => s.trim().replace(/<[^>]*>/g, ''))

const fundingGoalSchema = z
  .number()
  .min(50_000, 'الحد الأدنى للتمويل هو 50,000 ريال')
  .max(100_000_000, 'الحد الأقصى للتمويل هو 100,000,000 ريال')

// URL validation: must be valid https URL
const urlSchema = z
  .string()
  .url('الرابط يجب أن يكون URL صحيح')
  .refine(
    url => url.startsWith('https://'),
    'الرابط يجب أن يكون HTTPS لأسباب أمنية'
  )
  .or(z.literal(''))
  .transform(s => s || null)
  .nullable()

export const createProjectSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  category: z.enum(VALID_CATEGORIES),
  fundingGoal: fundingGoalSchema,
  image: urlSchema.nullable(),
  videoUrl: urlSchema.nullable(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.partial()

export const projectFilterSchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  status: z.enum(['draft', 'active', 'funded', 'cancelled']).optional(),
  minFunding: fundingGoalSchema.optional(),
  maxFunding: fundingGoalSchema.optional(),
  sortBy: z.enum(['recent', 'trending', 'funded']).optional(),
})

export type ProjectFilterInput = z.infer<typeof projectFilterSchema>
