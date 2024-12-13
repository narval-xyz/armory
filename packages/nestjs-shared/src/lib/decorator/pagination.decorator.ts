import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiQuery, ApiResponse } from '@nestjs/swagger'

type PaginatedDecoratorOptions = {
  type: Type
  summary?: string
  description?: string
}

export function Paginated(options: PaginatedDecoratorOptions) {
  return applyDecorators(
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Cursor for pagination. Use the next cursor from previous response to get next page'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of records to return per page'
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      type: String,
      description: 'Field to order results by'
    }),
    ApiQuery({
      name: 'desc',
      required: false,
      type: String,
      description: 'Set to "true" or "1" for descending order'
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: options.description || 'Successfully retrieved paginated list',
      type: options.type
    })
  )
}
