import { coerce } from '@narval/nestjs-shared'
import { RsaPrivateKey, rsaPrivateKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'

const ImportKey = z.object({
  jwk: rsaPrivateKeySchema,
  createdAt: z.number() // epoch in seconds
})
export type ImportKey = z.infer<typeof ImportKey>

@Injectable()
export class ImportRepository {
  private KEY_PREFIX = 'import:'

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id}`
  }

  async findById(clientId: string, id: string): Promise<ImportKey | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id))

    if (value) {
      return coerce.decode(ImportKey, value)
    }

    return null
  }

  async save(clientId: string, privateKey: RsaPrivateKey): Promise<ImportKey> {
    const createdAt = Date.now() / 1000
    const importKey: ImportKey = {
      jwk: privateKey,
      createdAt
    }

    await this.keyValueService.set(this.getKey(clientId, privateKey.kid), coerce.encode(ImportKey, importKey))

    return importKey
  }
}
