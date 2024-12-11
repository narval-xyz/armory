import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { PaginationOptions } from '../type/pagination.type'

export const PaginationParam = createParamDecorator((_data: unknown, context: ExecutionContext): PaginationOptions => {
  const req = context.switchToHttp().getRequest()
  return PaginationOptions.parse(req.query)
})
