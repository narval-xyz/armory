import { PolicyEngineException } from '@app/orchestration/policy-engine/core/exception/policy-engine.exception'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { HttpStatus } from '@nestjs/common'

export class AuthorizationRequestAlreadyProcessingException extends PolicyEngineException {
  constructor(authzRequest: AuthorizationRequest) {
    super({
      message: 'Authorization request is already in process',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        id: authzRequest.id,
        orgId: authzRequest.orgId,
        status: authzRequest.status
      }
    })
  }
}
