import { Injectable } from '@nestjs/common'
import { WalletRepository } from '../../persistence/repository/_OLD_WALLET_.repository'

@Injectable()
export class AdminService {
  constructor(private _OLD_WALLET_Repository: WalletRepository) {}

  async getWallets(clientId: string) {
    const _OLD_WALLETS_ = await this._OLD_WALLET_Repository.findByClientId(clientId)
    return _OLD_WALLETS_
  }
}
