import { HttpSource } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { DataStoreException } from '../../core/exception/data-store.exception'
import { DataStoreRepository } from '../../core/repository/data-store.repository'

@Injectable()
export class HttpDataStoreRepository implements DataStoreRepository {
  async fetch<Data>(source: HttpSource): Promise<Data> {
    try {
      const client = axios.create()
      axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay })
      const { data } = await client.get<Data>(source.url, { headers: source.headers })

      return data
    } catch (error) {
      throw new DataStoreException({
        message: 'Unable to fetch remote data source via HTTP',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { source },
        origin: error
      })
    }
  }
}
