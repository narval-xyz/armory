import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { PrivateWallet } from '../../../shared/type/domain.type'

@Injectable()
export class WalletRepository {
  private KEY_PREFIX = 'wallet'

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id}`
  }

  async findById(clientId: string, id: string): Promise<PrivateWallet | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return coerce.decode(PrivateWallet, value)
    }

    return null
  }

  async save(clientId: string, wallet: PrivateWallet): Promise<PrivateWallet> {
    await this.keyValueService.set(this.getKey(clientId, wallet.id.toLowerCase()), coerce.encode(PrivateWallet, wallet))

    return wallet
  }
}
