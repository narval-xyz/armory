import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Collection, PrivateAccount } from '../../../shared/type/domain.type'

@Injectable()
export class AccountRepository {
  private KEY_PREFIX = Collection.ACCOUNT

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

  async findById(clientId: string, id: string): Promise<PrivateAccount | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(PrivateAccount, value)
    }

    return null
  }

  async findByClientId(clientId: string): Promise<PrivateAccount[]> {
    const values = await this.keyValueService.find(this.getMetadata(clientId))
    return values ? values.map((value) => coerce.decode(PrivateAccount, value)) : []
  }

  async save(clientId: string, account: PrivateAccount): Promise<PrivateAccount> {
    await this.keyValueService.set(
      this.getKey(clientId, account.id.toLowerCase()),
      coerce.encode(PrivateAccount, account),
      this.getMetadata(clientId)
    )
    return account
  }
}
