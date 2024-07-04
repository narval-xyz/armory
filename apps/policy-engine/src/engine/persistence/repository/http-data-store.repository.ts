import { LoggerService } from '@narval/nestjs-shared'
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
  constructor(
    private httpService: HttpService,
    private logger: LoggerService
  ) {}

  fetch<Data>(source: HttpSource): Promise<Data> {
    return lastValueFrom(
      this.httpService
        .get<Data>(source.url, {
          headers: source.headers,
          'axios-retry': {
            retries: MAX_RETRIES,
            retryDelay: axiosRetry.exponentialDelay,
            onRetry: (retryCount) => {
              this.logger.log('Retry request to fetch HTTP data source', {
                retryCount,
                maxRetries: MAX_RETRIES,
                url: source.url.split('?')[0]
              })
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
}
