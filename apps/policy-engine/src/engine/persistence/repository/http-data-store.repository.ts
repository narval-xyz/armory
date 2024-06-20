import { HttpSource } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import axiosRetry from 'axios-retry'
import { catchError, lastValueFrom, map } from 'rxjs'
import { DataStoreException } from '../../core/exception/data-store.exception'
import { DataStoreRepository } from '../../core/repository/data-store.repository'

const MAX_RETRIES = 3

@Injectable()
export class HttpDataStoreRepository implements DataStoreRepository {
  constructor(private httpService: HttpService) {}

  fetch<Data>(source: HttpSource): Promise<Data> {
    return lastValueFrom(
      this.httpService
        .get<Data>(source.url, {
          headers: source.headers,
          'axios-retry': {
            retries: MAX_RETRIES,
            retryDelay: axiosRetry.exponentialDelay,
            onRetry: (retryCount) => {
              console.log(`Retrying request attempt ${retryCount}`)
            }
          }
        })
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            throw new DataStoreException({
              message: 'Unable to fetch remote data source via HTTP',
              suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              context: { source },
              origin: error
            })
          })
        )
    )
  }

  // async fetch<Data>(source: HttpSource): Promise<Data> {
  //   try {
  //     const client = axios.create()
  //     axiosRetry(client, { retries: MAX_RETRIES, retryDelay: axiosRetry.exponentialDelay })
  //     const { data } = await client.get<Data>(source.url, { headers: source.headers })

  //     return data
  //   } catch (error) {
  //     throw new DataStoreException({
  //       message: 'Unable to fetch remote data source via HTTP',
  //       suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //       context: { source },
  //       origin: error
  //     })
  //   }
  // }
}
