import { FIXTURE } from '@narval/authz-shared'
import { Injectable, Logger } from '@nestjs/common'
import { compact } from 'lodash/fp'
import { ORGANIZATION } from 'packages/authz-shared/src/lib/dev.fixture'
import { Seeder } from '../../../shared/module/persistence/persistence.type'
import { EntityService } from '../core/service/entity.service'
import { AddressBookRepository } from './repository/address-book.repository'
import { CredentialRepository } from './repository/credential.repository'
import { TokenRepository } from './repository/token.repository'
import { UserGroupRepository } from './repository/user-group.repository'
import { UserWalletRepository } from './repository/user-wallet.repository'
import { UserRepository } from './repository/user.repository'
import { WalletGroupRepository } from './repository/wallet-group.repository'
import { WalletRepository } from './repository/wallet.repository'

@Injectable()
export class EntityStoreSeed implements Seeder {
  private logger = new Logger(EntityStoreSeed.name)

  constructor(
    private addressBookRepository: AddressBookRepository,
    private credentialRepository: CredentialRepository,
    private tokenRepository: TokenRepository,
    private userGroupRepository: UserGroupRepository,
    private userRepository: UserRepository,
    private userWalletRepository: UserWalletRepository,
    private walletGroupRepository: WalletGroupRepository,
    private walletRepository: WalletRepository,
    private entityService: EntityService
  ) {}

  async germinate(): Promise<void> {
    this.logger.log('Germinating the Entity Store module database')

    await Promise.all(
      Object.values(FIXTURE.USER).map((entity) => this.userRepository.create(FIXTURE.ORGANIZATION.uid, entity))
    )

    await Promise.all(
      Object.values(FIXTURE.CREDENTIAL).map((entity) => this.credentialRepository.create(ORGANIZATION.uid, entity))
    )

    await Promise.all(
      Object.values(FIXTURE.WALLET).map((entity) => this.walletRepository.create(ORGANIZATION.uid, entity))
    )

    await Promise.all(
      Object.values(FIXTURE.WALLET_GROUP).map((entity) => this.walletGroupRepository.create(ORGANIZATION.uid, entity))
    )

    await Promise.all(
      Object.values(FIXTURE.USER_GROUP).map((entity) => this.userGroupRepository.create(ORGANIZATION.uid, entity))
    )

    await Promise.all(
      compact(
        Object.values(FIXTURE.WALLET).map(({ uid, assignees }) => {
          if (assignees?.length) {
            return assignees.map((userId) =>
              this.userWalletRepository.create(ORGANIZATION.uid, {
                userId,
                walletId: uid
              })
            )
          }
        })
      )
    )

    await Promise.all(FIXTURE.ADDRESS_BOOK.map((entity) => this.addressBookRepository.create(ORGANIZATION.uid, entity)))

    await this.tokenRepository.create(ORGANIZATION.uid, Object.values(FIXTURE.TOKEN))

    this.logger.log('Entities seeded', await this.entityService.getEntities(ORGANIZATION.uid))
  }
}
