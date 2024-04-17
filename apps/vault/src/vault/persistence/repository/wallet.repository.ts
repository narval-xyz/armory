import { Injectable } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { walletSchema } from '../../../shared/schema/wallet.schema'
import { Wallet } from '../../../shared/type/domain.type'

@Injectable()
export class WalletRepository {
  private KEY_PREFIX = 'wallet'

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(clientId: string, id: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${id}`
  }

  async findById(clientId: string, id: string): Promise<Wallet | null> {
    const value = await this.keyValueService.get(this.getKey(clientId, id.toLowerCase()))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(clientId: string, wallet: Wallet): Promise<Wallet> {
    await this.keyValueService.set(this.getKey(clientId, wallet.id.toLowerCase()), this.encode(wallet))

    return wallet
  }

  private encode(wallet: Wallet): string {
    return JSON.stringify(wallet)
  }

  private decode(value: string): Wallet {
    return walletSchema.parse(JSON.parse(value))
  }
}
