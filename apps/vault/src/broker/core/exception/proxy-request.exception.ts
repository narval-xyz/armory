import { BrokerException } from './broker.exception'

export class ProxyRequestException extends BrokerException {
  public data: any
  public code: number
  public headers: Record<string, any>

  constructor({
    data,
    status,
    message,
    headers,
    context
  }: {
    data: any
    status: number
    message: string
    headers: Record<string, any>
    context: Record<string, any>
  }) {
    super({
      message: message ? message : 'Provider request failed',
      suggestedHttpStatusCode: status,
      context
    })
    this.data = data
    this.code = status
    this.headers = headers
  }
}
