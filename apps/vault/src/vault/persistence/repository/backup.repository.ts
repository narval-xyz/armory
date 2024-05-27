import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { Backup } from '../../../shared/type/domain.type'

@Injectable()
export class BackupRepository {
  constructor(private keyValueService: KeyValueService) {}
  private KEY_PREFIX = 'mnemonic'

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id.toLowerCase()}`
  }

  async findById(clientId: string, id: string): Promise<Backup | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id))

    if (value) {
      return coerce.decode(Backup, value)
    }

    return null
  }

  async save(clientId: string, key: Backup): Promise<Backup> {
    await this.keyValueService.set(this.getKey(clientId, key.keyId), coerce.encode(Backup, key))

    return key
  }
}
