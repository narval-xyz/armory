import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { HttpStatus } from '@nestjs/common'
import { ZodIssue } from 'zod'

export class DecodeAuthorizationRequestException extends ApplicationException {
  constructor(reasons: ZodIssue[]) {
    super({
      message: 'Failed to decode authorization request',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { reasons }
    })
  }
}
