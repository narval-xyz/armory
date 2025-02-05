import { HttpStatus } from '@nestjs/common'
import { BrokerException } from './broker.exception'

export class UrlParserException extends BrokerException {
  constructor({ url, message }: { url: string; message?: string }) {
    super({
      message: message || `Cannot parse url`,
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { url }
    })
  }
}
