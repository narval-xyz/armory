import { HttpException, HttpStatus } from '@nestjs/common'

export type ApplicationExceptionParams = {
  message: string
  suggestedHttpStatusCode: HttpStatus
  context?: unknown
  originalError?: Error
}

export class ApplicationException extends HttpException {
  readonly context: unknown
  readonly originalError?: Error

  constructor(params: ApplicationExceptionParams) {
    super(params.message, params.suggestedHttpStatusCode)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationException)
    }

    this.name = this.constructor.name
    this.context = params.context
    this.originalError = params.originalError
  }
}
