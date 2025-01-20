import { HttpStatus } from '@nestjs/common'
import { ApplicationExceptionParams } from '../../../shared/exception/application.exception'
import { BrokerException } from './broker.exception'

export class AssetException extends BrokerException {
  constructor(params?: Partial<ApplicationExceptionParams>) {
    super({
      message: params?.message || 'Asset exception',
      suggestedHttpStatusCode: params?.suggestedHttpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      ...params
    })
  }
}
