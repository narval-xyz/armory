import { Inject, Injectable } from '@nestjs/common'
import { KeyMetadata, KeyValueRepository } from '../repository/key-value.repository'

@Injectable()
export class KeyValueService {
  constructor(@Inject(KeyValueRepository) private keyValueRepository: KeyValueRepository) {}

  async get(key: string): Promise<string | null> {
    return this.keyValueRepository.get(key)
  }

  async findByMetadata(metadata: KeyMetadata): Promise<string[] | null> {
    return this.keyValueRepository.findByMetadata(metadata)
  }

  async set(key: string, value: string, metadata: KeyMetadata): Promise<boolean> {
    return this.keyValueRepository.set(key, value, metadata)
  }

  async delete(key: string): Promise<boolean> {
    return this.keyValueRepository.delete(key)
  }
}
