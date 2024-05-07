import { Source } from '@narval/policy-engine-shared'

export interface DataStoreRepository {
  fetch<Data>(source: Source): Promise<Data>
}
