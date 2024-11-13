import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { BadRequestException, ExecutionContext, createParamDecorator } from '@nestjs/common'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const factory = (value: any, ctx: ExecutionContext) => {
  const headers = ctx.switchToHttp().getRequest().headers
  const clientId = headers[REQUEST_HEADER_CLIENT_ID]

  if (clientId) {
    return clientId
  }

  throw new BadRequestException(`Missing ${REQUEST_HEADER_CLIENT_ID} header`)
}

/**
 * Decorator that extracts the client ID from the request object.
 *
 * @throw BadRequestException
 */
export const ClientId = createParamDecorator(factory)
