import {
  AccountClassification,
  AccountType,
  AddressBookAccountEntity,
  Alg,
  CredentialEntity,
  Entities,
  OrganizationEntity,
  TokenEntity,
  UserEntity,
  UserGroupEntity,
  UserRole,
  UserWalletEntity,
  WalletEntity,
  WalletGroupEntity
} from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { map } from 'lodash/fp'
import request from 'supertest'
import { sha256 } from 'viem'
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

  const users: UserEntity[] = [
    {
      uid: '2d7a6811-509f-4bee-90fb-e382fc127de5',
      role: UserRole.ADMIN
    },
    {
      uid: '70d4128a-4b47-4944-859b-c570c69d3120',
      role: UserRole.ADMIN
    }
  ]

  const credentials: CredentialEntity[] = [
    {
      uid: sha256('0x5a4c3948723e02cbdef57d0eeb0fa8e2fc8f81fc'),
      pubKey: '0x5a4c3948723e02cbdef57d0eeb0fa8e2fc8f81fc',
      alg: Alg.ES256K,
      userId: users[0].uid
    }
  ]

  const wallets: WalletEntity[] = [
    {
      uid: 'a5c1fd4e-b021-4fad-b5a6-256b434916ef',
      address: '0x648edbd0e1bd5f15d58481bc7f034a790f9741fe',
      accountType: AccountType.EOA,
      chainId: 1
    },
    {
      uid: '3fe39a8e-1721-4111-bc3a-4f89c0d67594',
      address: '0x40710fae7b7d1200b644a579ddee65aecd7a991a',
      accountType: AccountType.EOA,
      chainId: 1
    }
  ]

  const walletGroups: WalletGroupEntity[] = [
    {
      uid: 'a104baeb-c9dd-4066-ae56-d85168715f90',
      wallets: map('uid', wallets)
    }
  ]

  const userWallets: UserWalletEntity[] = [
    {
      userId: users[0].uid,
      walletId: wallets[0].uid
    },
    {
      userId: users[1].uid,
      walletId: wallets[1].uid
    }
  ]

  const userGroups: UserGroupEntity[] = [
    {
      uid: 'd160dab5-211a-447d-9c25-2772e3ecbe17',
      users: [users[0].uid]
    }
  ]

  const addressBook: AddressBookAccountEntity[] = [
    {
      uid: '6b88f31f-564f-4463-86a6-28c3ad9105ff',
      address: '0xeff7eda2dd2567b80f96ba5eb292e399cc360a05',
      chainId: 1,
      classification: AccountClassification.EXTERNAL
    }
  ]

  const tokens: TokenEntity[] = [
    {
      uid: '2ece731a-51be-4b4f-91de-5665eacf7006',
      address: '0x63d74e23f70f66511417bc7acf95f002d1dbd33c',
      chainId: 1,
      symbol: 'AAA',
      decimals: 18
    }
  ]

  const sortByUid = <E extends { uid: string }>(entities: E[]): E[] => {
    return entities.sort((a, b) => a.uid.localeCompare(b.uid))
  }

  const getDeterministicEntities = ({
    users,
    wallets,
    walletGroups,
    userGroups,
    addressBook,
    credentials
  }: Entities): Entities => {
    return {
      addressBook: sortByUid(addressBook),
      credentials: sortByUid(credentials),
      tokens: sortByUid(tokens),
      userGroups: sortByUid(userGroups),
      users: sortByUid(users),
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
          userGroups,
          users,
          walletGroups,
          wallets,
          tokens
        })
      )
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
