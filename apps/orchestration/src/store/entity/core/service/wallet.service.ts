import { WalletEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create(orgId: string, wallet: WalletEntity): Promise<WalletEntity> {
    return this.walletRepository.create(orgId, wallet)
  }
}
