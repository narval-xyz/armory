import { BrokerException } from './broker.exception'

export class ProxyRequestException extends BrokerException {
  public data: unknown
  public code: number
  public headers: Record<string, unknown>

  constructor({
    data,
    status,
    message,
    headers,
    context
  }: {
    data: unknown
    status: number
    message: string
    headers: Record<string, unknown>
    context: Record<string, unknown>
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
