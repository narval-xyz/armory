import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { RootKey } from '../../../shared/type/domain.type'

@Injectable()
export class MnemonicRepository {
  private KEY_PREFIX = 'mnemonic'

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id}`
  }

  async findById(clientId: string, id: string): Promise<RootKey | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(RootKey, value)
    }

    return null
  }

  async save(clientId: string, key: RootKey): Promise<RootKey> {
    await this.keyValueService.set(this.getKey(clientId, key.keyId.toLowerCase()), coerce.encode(RootKey, key))

    return key
  }
}
