import { AuthorizationRequest } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class AuthorizationRequestAlreadyProcessingException extends ApplicationException {
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
