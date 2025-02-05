import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class AmbiguityException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Cannot resolve request due to data ambiguity',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      ...params
    })
  }
}
