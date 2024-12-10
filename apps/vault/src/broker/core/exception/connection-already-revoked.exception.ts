import { HttpStatus } from '@nestjs/common'
import { BrokerException } from './broker.exception'

export class ConnectionAlreadyRevokedException extends BrokerException {
  constructor(context: { clientId: string; connectionId: string }) {
    super({
      message: 'Connection already revoked',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context
    })
  }
}
