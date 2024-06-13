import { Injectable } from '@nestjs/common'
import { MnemonicRepository } from '../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class AdminService {
  constructor(
    private walletRepository: WalletRepository,
    private mnemonicRepository: MnemonicRepository
  ) {}

  async getWallets(clientId: string) {
    const wallets = await this.walletRepository.findByClientId(clientId)
    return wallets
  }

  async getSeeds(clientId: string) {
    const seeds = await this.mnemonicRepository.findByClientId(clientId)
    return seeds
  }
}
