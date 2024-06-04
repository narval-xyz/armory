import { Injectable } from '@nestjs/common'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class AdminService {
  constructor(private walletRepository: WalletRepository) {}

  async getWallets(clientId: string) {
    const wallets = await this.walletRepository.findByClientId(clientId)
    return wallets
  }
}
