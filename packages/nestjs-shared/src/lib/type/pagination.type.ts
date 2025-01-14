import { z } from 'zod'

export const Page = z
  .object({
    next: z.string().nullable()
  })
  .optional()
export type Page = z.infer<typeof Page>

export const PageCursorEncoder = z
  .object({
    id: z.string(),
    createdAt: z.date()
  })
  .transform((data) => {
    const cursorData = `${data.createdAt.toISOString()}|${data.id}`
    return Buffer.from(cursorData).toString('base64')
  })
export type PageCursorEncoder = z.infer<typeof PageCursorEncoder>

export const PageCursorDecoder = z
  .string()
  .transform((cursor) => Buffer.from(cursor, 'base64').toString())
  .pipe(
    z
      .string()
      .regex(/^[^|]+\|[^|]+$/, 'Cursor must contain exactly one "|"')
      .transform((str) => {
        const [timestamp, id] = str.split('|')
        return { timestamp, id }
      })
      .pipe(
        z
          .object({
            timestamp: z.string().datetime(),
            id: z.string().min(1)
          })
          .transform(({ timestamp, id }) => ({
            id,
            createdAt: new Date(timestamp)
          }))
      )
  )
export type PageCursor = z.infer<typeof PageCursorDecoder>

export const createPaginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    page: Page.optional()
  })

export type PaginatedResult<T> = z.infer<ReturnType<typeof createPaginatedSchema<z.ZodType<T>>>>

export const PaginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  direction: z.enum(['prev', 'next']).optional().default('next')
})
export type PaginationQuery = z.infer<typeof PaginationQuery>

export type PaginationOptions = {
  take?: number
  cursor?: PageCursor
  skip?: number
  sortOrder?: 'asc' | 'desc'
  orderBy?: { [key: string]: 'asc' | 'desc' }[]
  disabled?: boolean
}
