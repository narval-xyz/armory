import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { EncryptionKeyException } from './encryption-key.exception'

export class InvalidJweHeaderException extends EncryptionKeyException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Invalid JWE header',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.UNPROCESSABLE_ENTITY,
      ...params
    })
  }
}
