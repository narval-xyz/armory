import { HttpSource } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import axiosRetry from 'axios-retry'
import { catchError, lastValueFrom, map } from 'rxjs'
import { DataStoreException } from '../../core/exception/data-store.exception'
import { DataStoreRepository } from '../../core/repository/data-store.repository'

const MAX_RETRIES = 3

@Injectable()
export class HttpDataStoreRepository implements DataStoreRepository {
  private logger = new Logger(HttpDataStoreRepository.name)

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
              this.logger.warn(`Retrying request attempt ${retryCount}`)
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
