import { LoggerService } from '@narval/nestjs-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { omit } from 'lodash/fp'
import { catchError, lastValueFrom, map, tap, throwError } from 'rxjs'
import { CoinGeckoException } from './coin-gecko.exception'
import { CoinList, SimplePrice, SimplePriceOption } from './coin-gecko.type'

@Injectable()
export class CoinGeckoClient {
  constructor(
    private httpService: HttpService,
    private logger: LoggerService
  ) {}

  static AUTH_HEADER = 'x-cg-pro-api-key'
  static V3_URL = 'https://api.coingecko.com/api/v3'

  async getSimplePrice(options: SimplePriceOption): Promise<SimplePrice> {
    const request = {
      method: 'get',
      url: this.getEndpoint('/simple/price', options.url),
      headers: {
        ...(options.apiKey && { [CoinGeckoClient.AUTH_HEADER]: options.apiKey })
      },
      params: {
        ids: this.formatStringArray(options.data.ids),
        vs_currencies: this.formatStringArray(options.data.vs_currencies),
        precision: options.data.precision,
        include_market_cap: options.data.include_market_cap,
        include_24h_volume: options.data.include_24h_volume,
        include_24h_change: options.data.include_24h_change,
        include_last_updated_at: options.data.include_last_updated_at
      }
    }

    this.logger.log('Request prices for CoinGecko', omit(['headers'], request))

    return lastValueFrom(
      this.httpService.request<SimplePrice>(request).pipe(
        map((response) => response.data),
        tap((prices) => this.logger.log('Received prices from CoinGecko', prices)),
        catchError((error) => this.throwError(request, error))
      )
    )
  }

  // IMPORTANT: used internally to build the static Asset ID to Coin ID index
  // JSON.
  async getCoinList(): Promise<CoinList> {
    const request: AxiosRequestConfig = {
      method: 'get',
      url: `${CoinGeckoClient.V3_URL}/coins/list`,
      params: {
        include_platform: true
      }
    }

    return lastValueFrom(
      this.httpService.request<CoinList>(request).pipe(
        map((response) => response.data),
        catchError((error) => this.throwError(request, error))
      )
    )
  }

  private getEndpoint(path: string, url?: string): string {
    return `${url || CoinGeckoClient.V3_URL}${path}`
  }

  private formatStringArray(value: string[]): string {
    return value.map((value) => value.toLowerCase()).join(',')
  }

  private throwError(request: AxiosRequestConfig, error: Error) {
    const redactedRequest = {
      ...request,
      headers: omit(CoinGeckoClient.AUTH_HEADER, request.headers)
    }

    if (error instanceof AxiosError) {
      return throwError(
        () =>
          new CoinGeckoException({
            message: 'Request to CoinGecko failed',
            suggestedHttpStatusCode: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            origin: error,
            context: {
              cause: error.cause,
              request: redactedRequest,
              response: {
                data: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
              }
            }
          })
      )
    }

    return throwError(
      () =>
        new CoinGeckoException({
          message: 'Unknown CoinGecko client error',
          suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          origin: error,
          context: {
            request: redactedRequest
          }
        })
    )
  }
}
