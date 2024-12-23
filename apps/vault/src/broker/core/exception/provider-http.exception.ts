import { AxiosError } from 'axios'
import { Provider } from '../type/connection.type'

type ProviderHttpResponse = {
  status: number
  body: unknown
}

type ProviderHttpExceptionParams = {
  message?: string
  provider: Provider
  origin: AxiosError
  response: ProviderHttpResponse
  context?: unknown
}

export class ProviderHttpException extends Error {
  readonly response: ProviderHttpResponse
  readonly provider: Provider
  readonly origin: AxiosError
  readonly context?: unknown

  constructor({ message, provider, origin, response, context }: ProviderHttpExceptionParams) {
    super(message ?? `Provider ${provider.toUpperCase()} responded with ${response.status} error`)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProviderHttpException)
    }

    this.name = this.constructor.name
    this.response = response
    this.provider = provider
    this.origin = origin
    this.context = context
  }
}
