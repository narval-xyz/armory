import { HttpException, HttpStatus } from '@nestjs/common'

export type ApplicationExceptionParams = {
  message: string
  suggestedHttpStatusCode: HttpStatus
  context?: unknown
}

export class ApplicationException extends HttpException {
  readonly context: unknown

  constructor(params: ApplicationExceptionParams) {
    super(params.message, params.suggestedHttpStatusCode)

    this.name = this.constructor.name
    this.context = params.context
  }
}
