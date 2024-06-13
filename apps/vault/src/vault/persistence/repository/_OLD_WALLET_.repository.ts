import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Collection, _OLD_PRIVATE_WALLET_ } from '../../../shared/type/domain.type'

@Injectable()
export class WalletRepository {
  private KEY_PREFIX = Collection.WALLET

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

  async findById(clientId: string, id: string): Promise<_OLD_PRIVATE_WALLET_ | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(_OLD_PRIVATE_WALLET_, value)
    }

    return null
  }

  async findByClientId(clientId: string): Promise<_OLD_PRIVATE_WALLET_[]> {
    const values = await this.keyValueService.find(this.getMetadata(clientId))
    return values ? values.map((value) => coerce.decode(_OLD_PRIVATE_WALLET_, value)) : []
  }

  async save(clientId: string, _OLD_WALLET_: _OLD_PRIVATE_WALLET_): Promise<_OLD_PRIVATE_WALLET_> {
    await this.keyValueService.set(
      this.getKey(clientId, _OLD_WALLET_.id.toLowerCase()),
      coerce.encode(_OLD_PRIVATE_WALLET_, _OLD_WALLET_),
      this.getMetadata(clientId)
    )
    return _OLD_WALLET_
  }
}
