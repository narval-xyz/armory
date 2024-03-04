import { Inject, Injectable } from '@nestjs/common'
import { KeyValueRepository } from '../repository/key-value.repository'

/**
 * The key-value service is the main interface to interact with any storage
 * back-end. Since the storage backend lives outside the engine, it's considered
 * untrusted so the engine will encrypt the data before it sends them to the
 * storage.
 *
 * It's because of that the key-value service assumes data is always encrypted.
 * If you need non-encrypted data, you can use the key-value repository.
 */
@Injectable()
export class KeyValueService {
  constructor(@Inject(KeyValueRepository) private keyValueRepository: KeyValueRepository) {}

  async get(key: string): Promise<string | null> {
    // TODO (@wcalderipe, 01/03/2024): Add decryption step.
    return this.keyValueRepository.get(key)
  }

  async set(key: string, value: string): Promise<boolean> {
    // TODO (@wcalderipe, 01/03/2024): Add encryption step.
    return this.keyValueRepository.set(key, value)
  }

  async delete(key: string): Promise<boolean> {
    return this.keyValueRepository.delete(key)
  }
}
