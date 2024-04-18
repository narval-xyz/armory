import { HttpSource } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import { DataStoreException } from '../../core/exception/data-store.exception'
import { DataStoreRepository } from '../../core/repository/data-store.repository'

@Injectable()
export class HttpDataStoreRepository implements DataStoreRepository {
  constructor(private httpService: HttpService) {}

  fetch<Data>(source: HttpSource): Promise<Data> {
    return lastValueFrom(
      this.httpService.get<Data>(source.url, { headers: source.headers }).pipe(
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
