import { z } from 'zod'

export const Page = z
  .object({
    next: z.string().nullable()
  })
  .optional()

export type Page = z.infer<typeof Page>

export const createPaginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    page: Page
  })

export type PaginatedResult<T> = z.infer<ReturnType<typeof createPaginatedSchema<z.ZodType<T>>>>

export const PaginationOptions = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(25).optional(),
    orderBy: z.string().optional(),
    desc: z
      .string()
      .optional()
      .transform((val) => val === 'true')
    // TODO: @ptroger remamed 'desc' into 'sortOrder' that defaults to 'asc' and is optional
  })
  .transform((data) => ({
    cursor: data.cursor,
    limit: data.limit,
    orderBy: data.orderBy
      ? {
          [data.orderBy]: data.desc ? ('desc' as const) : ('asc' as const)
        }
      : undefined
  }))

export type PaginationOptions = z.infer<typeof PaginationOptions>

export type PrismaPagination = {
  take?: number
  cursor?: {
    id: string
  }
  skip?: number
  orderBy?: Record<string, 'asc' | 'desc'>
}
