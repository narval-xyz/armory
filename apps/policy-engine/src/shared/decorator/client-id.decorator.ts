import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'

export const factory = (_value: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

  if (!clientId || typeof clientId !== 'string') {
    throw new BadRequestException(`Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`)
  }

  return clientId
}

export const ClientId = createParamDecorator(factory)
