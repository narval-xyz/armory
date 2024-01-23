import {
  CreateApproval,
  CreateAuthorizationRequest,
  Signature
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/authorization-request.dto'
import { plainToInstance } from 'class-transformer'

// Not in love with the gymnastics required to bend a DTO to a domain object.
// Most of the complexity came from the discriminated union type.
// It's fine for now to keep it ugly here but I'll look at the problem later
export const toCreateAuthorizationRequest = (
  orgId: string,
  body: AuthorizationRequestDto
): CreateAuthorizationRequest => {
  const dto = plainToInstance(AuthorizationRequestDto, body)
  const approvals: CreateApproval[] = dto.approvals
  const authentication: Signature = dto.authentication

  return {
    orgId,
    approvals,
    authentication,
    evaluations: [],
    request: body.request
  }
}
