import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Collection, RootKey } from '../../../shared/type/domain.type'

@Injectable()
export class RootKeyRepository {
  private KEY_PREFIX = Collection.ROOT_KEY

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id}`
  }

  getMetadata(clientId: string): KeyMetadata {
    return {
      clientId,
      collection: this.KEY_PREFIX
    }
  }

  async findById(clientId: string, id: string): Promise<RootKey | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(RootKey, value)
    }

    return null
  }

  async findByClientId(clientId: string): Promise<RootKey[]> {
    const values = await this.keyValueService.find({ clientId, collection: this.KEY_PREFIX })
    return values ? values.map((value) => coerce.decode(RootKey, value)) : []
  }

  async save(clientId: string, key: RootKey): Promise<RootKey> {
    await this.keyValueService.set(
      this.getKey(clientId, key.keyId.toLowerCase()),
      coerce.encode(RootKey, key),
      this.getMetadata(clientId)
    )

    return key
  }
}
