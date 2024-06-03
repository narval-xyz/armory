import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { Backup, Collection } from '../../../shared/type/domain.type'

@Injectable()
export class BackupRepository {
  constructor(private keyValueService: KeyValueService) {}
  private KEY_PREFIX = Collection.BACKUP

  getMetadata(clientId: string): KeyMetadata {
    return {
      clientId,
      collection: this.KEY_PREFIX
    }
  }

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

  async findByClientId(clientId: string): Promise<Backup[]> {
    const values = await this.keyValueService.find(this.getMetadata(clientId))
    return values ? values.map((value) => coerce.decode(Backup, value)) : []
  }

  async save(clientId: string, key: Backup): Promise<Backup> {
    await this.keyValueService.set(
      this.getKey(clientId, key.keyId),
      coerce.encode(Backup, key),
      this.getMetadata(clientId)
    )

    return key
  }
}
