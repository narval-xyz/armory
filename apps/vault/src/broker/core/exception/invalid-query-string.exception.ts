import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class InvalidQueryStringException extends BrokerException {
  constructor(query: string, params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || `Query string "${query}" is required`,
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.BAD_REQUEST,
      ...params
    })
  }
}
