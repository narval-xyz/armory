import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class ProvisionException extends ApplicationException {
  constructor(message: string, context?: unknown) {
    super({
      message,
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context
    })
  }
}
