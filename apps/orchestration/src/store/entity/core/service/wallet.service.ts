import { WalletEntity, WalletGroupMemberEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class WalletService {
  constructor(private walletRepository: WalletRepository, private walletGroupRepository: WalletGroupRepository) {}

  async create(orgId: string, wallet: WalletEntity): Promise<WalletEntity> {
    return this.walletRepository.create(orgId, wallet)
  }

  async assignGroup(orgId: string, walletId: string, groupId: string): Promise<WalletGroupMemberEntity> {
    await this.walletGroupRepository.create(orgId, {
      uid: groupId,
      wallets: [walletId]
    })

    return { groupId, walletId }
  }
}
