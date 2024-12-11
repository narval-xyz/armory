import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Page } from '../type/pagination.type'

export function createPaginatedDto<T extends z.ZodObject<any>>(baseSchema: T) {
  const paginatedSchema = baseSchema.extend({
    page: Page.optional()
  })

  return class PaginatedDto extends createZodDto(paginatedSchema) {
    static create(data: z.infer<typeof paginatedSchema>): PaginatedDto {
      // Parse the data through the schema to trigger transformations
      const validated = paginatedSchema.parse(data)
      // Create instance and assign parsed data
      const instance = new this()
      return Object.assign(instance, validated)
    }
  }
}
