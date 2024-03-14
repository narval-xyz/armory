import { plainToInstance } from 'class-transformer'
import { CreateAuthorizationRequest } from '../../core/type/domain.type'
import { AuthorizationRequestDto } from '../../http/rest/dto/authorization-request.dto'

// Not in love with the gymnastics required to bend a DTO to a domain object.
// Most of the complexity came from the discriminated union type.
// It's fine for now to keep it ugly here but I'll look at the problem later
export const toCreateAuthorizationRequest = (
  orgId: string,
  body: AuthorizationRequestDto
): CreateAuthorizationRequest => {
  const dto = plainToInstance(AuthorizationRequestDto, body)
  const approvals: string[] = dto.approvals
  const authentication: string = dto.authentication

  return {
    orgId,
    approvals,
    authentication,
    evaluations: [],
    request: body.request
  }
}
