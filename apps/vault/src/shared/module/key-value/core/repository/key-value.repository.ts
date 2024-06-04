import { Collection } from '../../../../type/domain.type'

export const KeyValueRepository = Symbol('KeyValueRepository')

export interface KeyMetadata {
  collection: Collection
  clientId?: string
}

export interface KeyValueRepository {
  find(metadata: KeyMetadata): Promise<string[] | null>
  get(key: string): Promise<string | null>
  set(key: string, value: string, metadata: KeyMetadata): Promise<boolean>
  delete(key: string): Promise<boolean>
}
