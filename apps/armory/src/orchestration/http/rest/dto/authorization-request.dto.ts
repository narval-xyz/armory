import { createZodDto } from 'nestjs-zod'
import { AuthorizationRequest } from '../../../core/type/domain.type'

export class AuthorizationRequestDto extends createZodDto(
  AuthorizationRequest.pick({
    authentication: true,
    request: true,
    approvals: true,
    metadata: true
  })
) {}
