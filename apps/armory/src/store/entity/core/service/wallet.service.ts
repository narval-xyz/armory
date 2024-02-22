import {
  AssignWalletGroupRequest,
  RegisterWalletRequest,
  WalletEntity,
  WalletGroupMemberEntity
} from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private walletGroupRepository: WalletGroupRepository
  ) {}

  async create(orgId: string, input: RegisterWalletRequest): Promise<WalletEntity> {
    return this.walletRepository.create(orgId, input.request.wallet)
  }

  async assignGroup(orgId: string, input: AssignWalletGroupRequest): Promise<WalletGroupMemberEntity> {
    const { groupId, walletId } = input.request.data

    await this.walletGroupRepository.create(orgId, { uid: groupId })

    return { groupId, walletId }
  }
}
