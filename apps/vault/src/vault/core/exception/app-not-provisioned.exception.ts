import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class AppNotProvisionedException extends ApplicationException {
  constructor() {
    super({
      message: 'The app instance was not provisioned',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
