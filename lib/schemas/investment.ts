import { z } from 'zod'

const MIN_INVESTMENT = 1_000
const MAX_INVESTMENT = 10_000_000

export const createInvestmentSchema = z.object({
  projectId: z.string().uuid('معرّف المشروع غير صحيح'),
  amount: z
    .number()
    .finite('المبلغ يجب أن يكون رقماً صحيحاً')
    .min(
      MIN_INVESTMENT,
      `الحد الأدنى للاستثمار هو ${MIN_INVESTMENT.toLocaleString('ar-SA')} ريال`
    )
    .max(
      MAX_INVESTMENT,
      `الحد الأقصى للاستثمار هو ${MAX_INVESTMENT.toLocaleString('ar-SA')} ريال`
    ),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
})

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>

export const investmentFilterSchema = z.object({
  status: z
    .enum(['committed', 'paid', 'cancelled'])
    .optional(),
  sortBy: z.enum(['recent', 'amount']).optional(),
})

export type InvestmentFilterInput = z.infer<typeof investmentFilterSchema>
