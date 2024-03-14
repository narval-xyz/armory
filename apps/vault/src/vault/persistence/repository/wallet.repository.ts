import { Injectable } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { walletSchema } from '../../../shared/schema/wallet.schema'
import { Wallet } from '../../../shared/type/domain.type'

@Injectable()
export class WalletRepository {
  private KEY_PREFIX = 'wallet:'

  constructor(private keyValueService: EncryptKeyValueService) {}

  getKey(tenantId: string, id: string): string {
    return `${this.KEY_PREFIX}:${tenantId}:${id}`
  }

  async findById(tenantId: string, id: string): Promise<Wallet | null> {
    const value = await this.keyValueService.get(this.getKey(id, tenantId))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(tenantId: string, wallet: Wallet): Promise<Wallet> {
    await this.keyValueService.set(this.getKey(tenantId, wallet.id), this.encode(wallet))

    return wallet
  }

  private encode(wallet: Wallet): string {
    return JSON.stringify(wallet)
  }

  private decode(value: string): Wallet {
    return walletSchema.parse(JSON.parse(value))
  }
}
