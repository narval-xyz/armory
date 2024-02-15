import { HttpException, HttpStatus } from '@nestjs/common'

export type ApplicationExceptionParams = {
  message: string
  suggestedHttpStatusCode: HttpStatus
  context?: unknown
  origin?: Error
}

export class ApplicationException extends HttpException {
  readonly context: unknown
  readonly origin?: Error

  constructor(params: ApplicationExceptionParams) {
    super(params.message, params.suggestedHttpStatusCode)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationException)
    }

    this.name = this.constructor.name
    this.context = params.context
    this.origin = params.origin
  }
}
