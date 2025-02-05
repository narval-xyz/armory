import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { PaginationOptions, PaginationQuery } from '../type'
import { getPaginationQuery } from '../util'

export const PaginationParam = createParamDecorator((_data: unknown, context: ExecutionContext): PaginationOptions => {
  const req = context.switchToHttp().getRequest()

  const options = PaginationQuery.parse(req.query)
  return getPaginationQuery({ options })
})
