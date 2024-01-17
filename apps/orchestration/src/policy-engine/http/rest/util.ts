import { Action, CreateAuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
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
  const shared = {
    orgId,
    initiatorId: '97389cac-20f0-4d02-a3a9-b27c564ffd18',
    hash: dto.hash,
    evaluations: []
  }

  if (dto.isSignMessage(dto.request)) {
    return {
      ...shared,
      action: Action.SIGN_MESSAGE,
      request: {
        message: dto.request.message
      }
    }
  }

  return {
    ...shared,
    action: Action.SIGN_TRANSACTION,
    request: {
      from: dto.request.from,
      to: dto.request.to,
      data: dto.request.data,
      gas: dto.request.gas
    }
  }
}
