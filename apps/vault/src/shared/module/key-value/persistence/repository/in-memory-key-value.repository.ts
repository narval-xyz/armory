import { Injectable } from '@nestjs/common'
import { KeyMetadata, KeyValueRepository } from '../../core/repository/key-value.repository'

@Injectable()
export class InMemoryKeyValueRepository implements KeyValueRepository {
  private store = new Map<string, string>()
  private metadataStore = new Map<string, KeyMetadata>()

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async find(metadata: KeyMetadata): Promise<string[] | null> {
    const keys = Array.from(this.metadataStore.entries())
      .filter(([_, value]) => {
        return value.collection === metadata.collection && value.clientId === metadata.clientId
      })
      .map(([key, _]) => key)

    return keys.map((key) => this.store.get(key) as string)
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null
  }

  async set(key: string, value: string, metadata: KeyMetadata): Promise<boolean> {
    this.store.set(key, value)
    this.metadataStore.set(key, metadata)
    return true
  }

  async delete(key: string): Promise<boolean> {
    this.store.delete(key)
    this.metadataStore.delete(key)
    return true
  }
}
