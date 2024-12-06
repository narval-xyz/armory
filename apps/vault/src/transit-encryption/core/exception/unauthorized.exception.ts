import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { EncryptionKeyException } from './encryption-key.exception'

export class UnauthorizedException extends EncryptionKeyException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || "Encryption key doesn't belong to client",
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.UNAUTHORIZED,
      ...params
    })
  }
}
