import { CreateAuthorizationRequest, EvaluationMetadata, Request } from '@narval/policy-engine-shared'
import { nowSeconds } from '@narval/signature'
import { plainToInstance } from 'class-transformer'
import { AuthorizationRequestDto } from '../../http/rest/dto/authorization-request.dto'

const TEN_MINUTES = 60 * 10

// Not in love with the gymnastics required to bend a DTO to a domain object.
// Most of the complexity came from the discriminated union type.
// It's fine for now to keep it ugly here but I'll look at the problem later
export const toCreateAuthorizationRequest = (
  clientId: string,
  body: AuthorizationRequestDto
): CreateAuthorizationRequest => {
  const dto = plainToInstance(AuthorizationRequestDto, body)
  const authentication: string = dto.authentication
  const approvals: string[] = dto.approvals
  const metadata: EvaluationMetadata = {
    ...dto.metadata,
    expiresIn: dto.metadata?.expiresIn || TEN_MINUTES,
    issuedAt: nowSeconds()
  }
  const request = body.request

  return {
    clientId,
    approvals,
    authentication,
    evaluations: [],
    request: Request.parse(request),
    metadata
  }
}
