import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class BootstrapException extends ApplicationException {
  constructor(message: string, options?: { context?: unknown; origin?: Error }) {
    super({
      message,
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: options?.context,
      origin: options?.origin
    })
  }
}
