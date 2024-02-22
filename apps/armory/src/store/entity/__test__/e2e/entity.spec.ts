import {
  AddressBookAccountEntity,
  CredentialEntity,
  Entities,
  FIXTURE,
  OrganizationEntity,
  TokenEntity,
  UserEntity,
  UserGroupEntity,
  UserGroupMemberEntity,
  UserWalletEntity,
  WalletEntity,
  WalletGroupEntity,
  WalletGroupMemberEntity
} from '@narval/policy-engine-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../../armory.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../armory.constant'
import { OrchestrationModule } from '../../../../orchestration/orchestration.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'
import { CredentialRepository } from '../../persistence/repository/credential.repository'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'
import { TokenRepository } from '../../persistence/repository/token.repository'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'
import { UserWalletRepository } from '../../persistence/repository/user-wallet.repository'
import { UserRepository } from '../../persistence/repository/user.repository'
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

const API_RESOURCE_USER_ENTITY = '/store/entities'

describe('Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let addressBookRepository: AddressBookRepository
  let credentialRepository: CredentialRepository
  let orgRepository: OrganizationRepository
  let tokenRepository: TokenRepository
  let userGroupRepository: UserGroupRepository
  let userRepository: UserRepository
  let userWalletRepository: UserWalletRepository
  let walletGroupRepository: WalletGroupRepository
  let walletRepository: WalletRepository

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  const addressBook: AddressBookAccountEntity[] = FIXTURE.ADDRESS_BOOK
  const credentials: CredentialEntity[] = Object.values(FIXTURE.CREDENTIAL)
  const tokens: TokenEntity[] = Object.values(FIXTURE.TOKEN)
  const userGroupMembers: UserGroupMemberEntity[] = FIXTURE.USER_GROUP_MEMBER
  const userGroups: UserGroupEntity[] = Object.values(FIXTURE.USER_GROUP)
  const userWallets: UserWalletEntity[] = FIXTURE.USER_WALLET
  const users: UserEntity[] = Object.values(FIXTURE.USER)
  const walletGroupMembers: WalletGroupMemberEntity[] = FIXTURE.WALLET_GROUP_MEMBER
  const walletGroups: WalletGroupEntity[] = Object.values(FIXTURE.WALLET_GROUP)
  const wallets: WalletEntity[] = Object.values(FIXTURE.WALLET)

  const sortByUid = <E extends { uid: string }>(entities: E[]): E[] => {
    return entities.sort((a, b) => a.uid.localeCompare(b.uid))
  }

  const getDeterministicEntities = ({
    users,
    wallets,
    walletGroups,
    userGroups,
    addressBook,
    credentials,
    userGroupMembers,
    userWallets,
    walletGroupMembers
  }: Entities): Entities => {
    return {
      addressBook: sortByUid(addressBook),
      credentials: sortByUid(credentials),
      tokens: sortByUid(tokens),
      userGroupMembers: userGroupMembers.sort(),
      userGroups: sortByUid(userGroups),
      userWallets: userWallets.sort(),
      users: sortByUid(users),
      walletGroupMembers: walletGroupMembers.sort(),
      walletGroups: sortByUid(walletGroups),
      wallets: sortByUid(wallets)
    }
  }

  const bulkCreate = async <E>(
    orgId: string,
    entities: E[],
    repository: { create: (orgId: string, entity: E) => Promise<unknown> }
  ): Promise<void> => {
    await Promise.all(entities.map((entity) => repository.create(orgId, entity)))
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        QueueModule.forRoot(),
        OrchestrationModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    addressBookRepository = module.get<AddressBookRepository>(AddressBookRepository)
    credentialRepository = module.get<CredentialRepository>(CredentialRepository)
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository)
    tokenRepository = module.get<TokenRepository>(TokenRepository)
    userGroupRepository = module.get<UserGroupRepository>(UserGroupRepository)
    userRepository = module.get<UserRepository>(UserRepository)
    userWalletRepository = module.get<UserWalletRepository>(UserWalletRepository)
    walletGroupRepository = module.get<WalletGroupRepository>(WalletGroupRepository)
    walletRepository = module.get<WalletRepository>(WalletRepository)

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await orgRepository.create(organization.uid)
    await tokenRepository.create(organization.uid, tokens)

    // The order entities are created matters.
    await bulkCreate(organization.uid, users, userRepository)
    await bulkCreate(organization.uid, wallets, walletRepository)
    await bulkCreate(organization.uid, walletGroups, walletGroupRepository)
    await bulkCreate(organization.uid, userGroups, userGroupRepository)
    await bulkCreate(organization.uid, addressBook, addressBookRepository)
    await bulkCreate(organization.uid, userWallets, userWalletRepository)
    await bulkCreate(organization.uid, credentials, credentialRepository)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`GET ${API_RESOURCE_USER_ENTITY}`, () => {
    it('responds with the organization entities', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)

      expect(getDeterministicEntities(body)).toEqual(
        getDeterministicEntities({
          addressBook,
          credentials,
          tokens,
          userGroupMembers,
          userGroups,
          userWallets,
          users,
          walletGroupMembers,
          walletGroups,
          wallets
        })
      )
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
