import { z } from 'zod'

// RFC 5321 compliant email with + allowed
const emailSchema = z
  .string()
  .email()
  .max(254, 'البريد الإلكتروني طويل جداً')
  .transform(s => s.toLowerCase().trim())

// Password: 8+ chars, uppercase, lowercase, digit
const passwordSchema = z
  .string()
  .min(8, 'يجب أن تكون كلمة المرور 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'يجب أن تتضمن كلمة المرور حرفاً كبيراً واحداً')
  .regex(/[a-z]/, 'يجب أن تتضمن كلمة المرور حرفاً صغيراً واحداً')
  .regex(/[0-9]/, 'يجب أن تتضمن كلمة المرور رقماً واحداً')

// Full name: 3-100 chars, Arabic/English/spaces/hyphens
const fullNameSchema = z
  .string()
  .min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل')
  .max(100, 'الاسم طويل جداً')
  .regex(
    /^[؀-ۿa-zA-Z\s\-']{3,100}$/,
    'الاسم يحتوي على أحرف غير صحيحة'
  )
  .transform(s => s.trim())

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: z.enum(['investor', 'founder']).catch('investor'),
})

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Phone: Saudi format (+966, 0966, 966, or 9...)
export const phoneSchema = z
  .string()
  .regex(
    /^(\+966|0966|966|9)[0-9]{8}$/,
    'رقم الهاتف غير صحيح'
  )
  .transform(s => s.replace(/\s+/g, ''))

// National ID: 10 Saudi digits
export const nationalIdSchema = z
  .string()
  .length(10, 'رقم الهوية يجب أن يكون 10 أرقام')
  .regex(/^\d{10}$/, 'رقم الهوية يجب أن يحتوي على أرقام فقط')
