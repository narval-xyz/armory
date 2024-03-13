import { Inject, Injectable } from '@nestjs/common'
import { KeyValueRepository } from '../repository/key-value.repository'

@Injectable()
export class KeyValueService {
  constructor(@Inject(KeyValueRepository) private keyValueRepository: KeyValueRepository) {}

  async get(key: string): Promise<string | null> {
    return this.keyValueRepository.get(key)
  }

  async set(key: string, value: string): Promise<boolean> {
    return this.keyValueRepository.set(key, value)
  }

  async delete(key: string): Promise<boolean> {
    return this.keyValueRepository.delete(key)
  }

  static encode(value: unknown): string {
    return JSON.stringify(value)
  }
}
