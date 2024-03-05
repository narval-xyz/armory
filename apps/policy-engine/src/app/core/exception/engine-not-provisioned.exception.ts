import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class EngineNotProvisionedException extends ApplicationException {
  constructor() {
    super({
      message: 'The policy engine instance was not provisioned',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
