import { HttpStatus } from '@nestjs/common'
import { BrokerException } from './broker.exception'

export class ModelInvalidException extends BrokerException {
  constructor() {
    super({
      message: 'Invalid model',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
