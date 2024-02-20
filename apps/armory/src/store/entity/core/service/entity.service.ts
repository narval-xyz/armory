import { Entities } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'
import { CredentialRepository } from '../../persistence/repository/credential.repository'
import { TokenRepository } from '../../persistence/repository/token.repository'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'
import { UserRepository } from '../../persistence/repository/user.repository'
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class EntityService {
  constructor(
    private addressBookRepository: AddressBookRepository,
    private credentialRepository: CredentialRepository,
    private tokenRepository: TokenRepository,
    private userGroupRepository: UserGroupRepository,
    private userRepository: UserRepository,
    private walletGroupRepository: WalletGroupRepository,
    private walletRepository: WalletRepository
  ) {}

  async getEntities(orgId: string): Promise<Entities> {
    const [addressBook, credentials, tokens, userGroups, users, walletGroups, wallets] = await Promise.all([
      this.addressBookRepository.findByOrgId(orgId),
      this.credentialRepository.findByOrgId(orgId),
      this.tokenRepository.findByOrgId(orgId),
      this.userGroupRepository.findByOrgId(orgId),
      this.userRepository.findByOrgId(orgId),
      this.walletGroupRepository.findByOrgId(orgId),
      this.walletRepository.findByOrgId(orgId)
    ])

    return {
      addressBook,
      credentials,
      tokens,
      userGroups,
      users,
      walletGroups,
      wallets
    }
  }
}
