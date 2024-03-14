import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_HEADER_CLIENT_ID } from '../../main.constant'

export const ClientId = createParamDecorator((data: unknown, context: ExecutionContext): string => {
  const req = context.switchToHttp().getRequest()
  const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]
  if (!clientId || typeof clientId !== 'string') {
    throw new Error(`Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`)
  }

  return clientId
})
