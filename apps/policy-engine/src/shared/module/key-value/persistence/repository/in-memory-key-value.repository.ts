import { Injectable } from '@nestjs/common'
import { KeyValueRepository } from '../../core/repository/key-value.repository'

@Injectable()
export class InMemoryKeyValueRepository implements KeyValueRepository {
  private store = new Map<string, string>()

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null
  }

  async set(key: string, value: string): Promise<boolean> {
    this.store.set(key, value)

    return true
  }

  async delete(key: string): Promise<boolean> {
    this.store.delete(key)

    return true
  }
}
