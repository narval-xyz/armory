import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class NotFoundException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Not found',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.NOT_FOUND,
      ...params
    })
  }
}
