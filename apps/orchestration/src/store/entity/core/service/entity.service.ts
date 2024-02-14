import { Entities } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'
import { TokenRepository } from '../../persistence/repository/token.repository'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'
import { UserWalletRepository } from '../../persistence/repository/user-wallet.repository'
import { UserRepository } from '../../persistence/repository/user.repository'
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class EntityService {
  constructor(
    private addressBookRepository: AddressBookRepository,
    private tokenRepository: TokenRepository,
    private userGroupRepository: UserGroupRepository,
    private userRepository: UserRepository,
    private userWalletRepository: UserWalletRepository,
    private walletGroupRepository: WalletGroupRepository,
    private walletRepository: WalletRepository
  ) {}

  async getEntities(orgId: string): Promise<Entities> {
    const [addressBook, tokens, userGroups, users, userWallets, walletGroups, wallets] = await Promise.all([
      this.addressBookRepository.findByOrgId(orgId),
      this.tokenRepository.findByOrgId(orgId),
      this.userGroupRepository.findByOrgId(orgId),
      this.userRepository.findByOrgId(orgId),
      this.userWalletRepository.findByOrgId(orgId),
      this.walletGroupRepository.findByOrgId(orgId),
      this.walletRepository.findByOrgId(orgId)
    ])

    return {
      addressBook,
      tokens,
      userGroups,
      userWallets,
      users,
      walletGroups,
      wallets
    }
  }
}
