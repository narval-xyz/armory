import { HttpStatus } from '@nestjs/common'
import { AuthorizationRequest } from '../type/domain.type'
import { PolicyEngineException } from './policy-engine.exception'

export class AuthorizationRequestAlreadyProcessingException extends PolicyEngineException {
  constructor(authzRequest: AuthorizationRequest) {
    super({
      message: 'Authorization request is already in process',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        id: authzRequest.id,
        clientId: authzRequest.clientId,
        status: authzRequest.status
      }
    })
  }
}
