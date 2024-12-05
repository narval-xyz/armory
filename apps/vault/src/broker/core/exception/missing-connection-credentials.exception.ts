import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class MissingConnectionCredentialsException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Missing connection credentials',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.UNPROCESSABLE_ENTITY,
      ...params
    })
  }
}
