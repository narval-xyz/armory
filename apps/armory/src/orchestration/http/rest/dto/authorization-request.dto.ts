import { AuthorizationRequest, JwtString, SerializedAuthorizationRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class AuthorizationRequestDto extends createZodDto(
  SerializedAuthorizationRequest.pick({
    authentication: true,
    request: true,
    metadata: true
  }).extend({
    approvals: AuthorizationRequest.shape.approvals.optional()
  })
) {}

export class ApprovalDto extends createZodDto(
  z.object({
    signature: JwtString
  })
) {}
