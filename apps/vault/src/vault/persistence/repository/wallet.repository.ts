import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Collection, PrivateWallet } from '../../../shared/type/domain.type'

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

  async findById(clientId: string, id: string): Promise<PrivateWallet | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(PrivateWallet, value)
    }

    return null
  }

  async findByClientId(clientId: string): Promise<PrivateWallet[]> {
    const values = await this.keyValueService.find(this.getMetadata(clientId))
    return values ? values.map((value) => coerce.decode(PrivateWallet, value)) : []
  }

  async save(clientId: string, wallet: PrivateWallet): Promise<PrivateWallet> {
    await this.keyValueService.set(
      this.getKey(clientId, wallet.id.toLowerCase()),
      coerce.encode(PrivateWallet, wallet),
      this.getMetadata(clientId)
    )
    return wallet
  }
}
