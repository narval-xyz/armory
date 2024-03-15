import { Hex } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { privateKeyToAddress } from 'viem/accounts'
import { Wallet } from '../../../shared/type/domain.type'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name)

  constructor(private walletRepository: WalletRepository) {}

  async importPrivateKey(tenantId: string, privateKey: Hex, walletId?: string): Promise<Wallet> {
    this.logger.log('Importing private key', {
      tenantId
    })
    const address = privateKeyToAddress(privateKey)
    const id = walletId || this.generateWalletId(address)

    const wallet = await this.walletRepository.save(tenantId, {
      id,
      privateKey,
      address
    })

    return wallet
  }

  generateWalletId(address: Hex): string {
    return `eip155:eoa:${address.toLowerCase()}`
  }
}
