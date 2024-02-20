import { HttpStatus } from '@nestjs/common'
import { ZodIssue } from 'zod'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class DecodeAuthorizationRequestException extends ApplicationException {
  constructor(reasons: ZodIssue[]) {
    super({
      message: 'Failed to decode authorization request',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { reasons }
    })
  }
}
