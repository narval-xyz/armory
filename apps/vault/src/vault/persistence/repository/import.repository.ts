import { coerce } from '@narval/nestjs-shared'
import { RsaPrivateKey } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Collection, ImportKey } from '../../../shared/type/domain.type'

@Injectable()
export class ImportRepository {
  private KEY_PREFIX = Collection.IMPORT

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

  async findById(clientId: string, id: string): Promise<ImportKey | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id))

    if (value) {
      return coerce.decode(ImportKey, value)
    }

    return null
  }

  async findByClientId(clientId: string): Promise<ImportKey[]> {
    const values = await this.keyValueService.find(this.getMetadata(clientId))
    return values ? values.map((value) => coerce.decode(ImportKey, value)) : []
  }

  async save(clientId: string, privateKey: RsaPrivateKey): Promise<ImportKey> {
    const createdAt = Date.now() / 1000
    const importKey: ImportKey = {
      jwk: privateKey,
      createdAt
    }

    await this.keyValueService.set(
      this.getKey(clientId, privateKey.kid),
      coerce.encode(ImportKey, importKey),
      this.getMetadata(clientId)
    )

    return importKey
  }
}
