import { SerializedAuthorizationRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class AuthorizationRequestDto extends createZodDto(
  SerializedAuthorizationRequest.pick({
    authentication: true,
    request: true,
    approvals: true,
    metadata: true
  })
) {}
