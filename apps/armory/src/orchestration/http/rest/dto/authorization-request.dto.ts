import { AuthorizationRequest, SerializedAuthorizationRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class AuthorizationRequestDto extends createZodDto(
  SerializedAuthorizationRequest.pick({
    authentication: true,
    request: true,
    metadata: true
  }).extend({
    approvals: AuthorizationRequest.shape.approvals.optional()
  })
) {}
