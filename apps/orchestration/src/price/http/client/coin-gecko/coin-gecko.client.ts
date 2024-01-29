import { CoinGeckoException } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.exception'
import { SimplePrice, SimplePriceOption } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.type'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { lowerCase } from 'lodash'
import { omit } from 'lodash/fp'
import { catchError, lastValueFrom, map, throwError } from 'rxjs'

@Injectable()
export class CoinGeckoClient {
  constructor(private httpService: HttpService) {}

  static AUTH_HEADER = 'x-cg-pro-api-key'
  static V3_URL = 'https://api.coingecko.com/api/v3'

  getSimplePrice(options: SimplePriceOption): Promise<SimplePrice> {
    const request = {
      method: 'get',
      url: `${options.url}/simple/price`,
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

    return lastValueFrom(
      this.httpService.request<SimplePrice>(request).pipe(
        map((response) => response.data),
        catchError((error) => this.throwError(request, error))
      )
    )
  }

  private formatStringArray(value: string[]): string {
    return value.map(lowerCase).join(',')
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
            originalError: error,
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
          originalError: error,
          context: {
            request: redactedRequest
          }
        })
    )
  }
}
