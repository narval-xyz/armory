import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class ScopedSyncException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Fail to sync provider connection',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.UNPROCESSABLE_ENTITY,
      ...params
    })
  }
}
