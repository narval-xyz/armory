import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class ConnectionParseException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Fail to parse connection after read',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      ...params
    })
  }
}
