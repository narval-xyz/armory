import { EncryptionService } from '@narval/encryption-module'
import { Inject, Injectable } from '@nestjs/common'
import { KeyValueRepository } from '../repository/key-value.repository'

/**
 * The key-value service is the main interface to interact with any storage
 * back-end. Since the storage backend lives outside the engine, it's considered
 * untrusted so the engine will encrypt the data before it sends them to the
 * storage.
 */
@Injectable()
export class EncryptKeyValueService {
  constructor(
    @Inject(KeyValueRepository) private keyValueRepository: KeyValueRepository,
    private encryptionService: EncryptionService
  ) {}

  async get(key: string): Promise<string | null> {
    const encryptedValue = await this.keyValueRepository.get(key)

    if (encryptedValue) {
      const value = await this.encryptionService.decrypt(Buffer.from(encryptedValue, 'hex'))

      return value.toString()
    }

    return null
  }

  async set(key: string, value: string): Promise<boolean> {
    const encryptedValue = await this.encryptionService.encrypt(value)

    return this.keyValueRepository.set(key, encryptedValue.toString('hex'))
  }

  async delete(key: string): Promise<boolean> {
    return this.keyValueRepository.delete(key)
  }

  static encode(value: unknown): string {
    return JSON.stringify(value)
  }
}
