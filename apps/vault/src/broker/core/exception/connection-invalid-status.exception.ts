import { HttpStatus } from '@nestjs/common'
import { ConnectionStatus } from '../type/connection.type'
import { BrokerException } from './broker.exception'

export class ConnectionInvalidStatusException extends BrokerException {
  constructor(context: { from: ConnectionStatus; to: ConnectionStatus; clientId: string; connectionId: string }) {
    super({
      message: `Cannot change connection status from ${context.from} to ${context.to}`,
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context
    })
  }
}
