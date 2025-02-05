import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_HEADER_CONNECTION_ID } from '../constant'

export const ConnectionId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const req = context.switchToHttp().getRequest()
  const connectionId = req.headers[REQUEST_HEADER_CONNECTION_ID]
  if (!connectionId || typeof connectionId !== 'string') {
    throw new BadRequestException(`Missing or invalid ${REQUEST_HEADER_CONNECTION_ID} header`)
  }

  return connectionId
})
