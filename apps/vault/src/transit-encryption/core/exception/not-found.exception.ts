import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { EncryptionKeyException } from './encryption-key.exception'

export class NotFoundException extends EncryptionKeyException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Encryption key not found',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.NOT_FOUND,
      ...params
    })
  }
}
