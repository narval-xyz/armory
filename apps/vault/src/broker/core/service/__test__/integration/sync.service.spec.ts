import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { mock } from 'jest-mock-extended'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../../../client/core/service/client.service'
import { MainModule } from '../../../../../main.module'
import { ProvisionService } from '../../../../../provision.service'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { testClient } from '../../../../__test__/util/mock-data'
import { SyncRepository } from '../../../../persistence/repository/sync.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { ANCHORAGE_TEST_API_BASE_URL } from '../../../provider/anchorage/__test__/server-mock/server'
import { ActiveConnectionWithCredentials, Provider } from '../../../type/connection.type'
import { Account, Address, KnownDestination, Wallet } from '../../../type/indexed-resources.type'
import { SyncOperationType, SyncResult } from '../../../type/provider.type'
import { Sync, SyncStatus } from '../../../type/sync.type'
import { AccountService } from '../../account.service'
import { AddressService } from '../../address.service'
import { ConnectionService } from '../../connection.service'
import { KnownDestinationService } from '../../known-destination.service'
import { SyncService } from '../../sync.service'
import { WalletService } from '../../wallet.service'

const toConnectionAssociation = (connection: ActiveConnectionWithCredentials) => ({
  clientId: connection.clientId,
  connectionId: connection.connectionId,
  createdAt: connection.createdAt,
  label: undefined,
  provider: connection.provider,
  revokedAt: undefined,
  status: connection.status,
  updatedAt: connection.updatedAt,
  url: connection.url
})

describe(SyncService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let accountService: AccountService
  let addressService: AddressService
  let clientService: ClientService
  let connection: ActiveConnectionWithCredentials
  let connectionService: ConnectionService
  let knownDestinationService: KnownDestinationService
  let provisionService: ProvisionService
  let syncRepository: SyncRepository
  let syncService: SyncService
  let walletService: WalletRepository

  const clientId = 'test-client-id'

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()

    accountService = module.get(AccountService)
    addressService = module.get(AddressService)
    clientService = module.get(ClientService)
    connectionService = module.get(ConnectionService)
    knownDestinationService = module.get(KnownDestinationService)
    provisionService = module.get(ProvisionService)
    syncRepository = module.get(SyncRepository)
    syncService = module.get(SyncService)
    testPrismaService = module.get(TestPrismaService)
    walletService = module.get(WalletService)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await provisionService.provision()
    await clientService.save(testClient)

    connection = await connectionService.create(clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE,
      url: ANCHORAGE_TEST_API_BASE_URL,
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    await app.init()
  })

  describe('execute', () => {
    let sync: Sync
    let walletOne: Wallet
    let walletTwo: Wallet
    let accountOne: Account
    let accountTwo: Account
    let addressOne: Address
    let addressTwo: Address
    let kdOne: KnownDestination
    let kdTwo: KnownDestination

    const now = new Date()

    beforeEach(async () => {
      sync = await syncRepository.create({
        clientId,
        syncId: randomUUID(),
        connectionId: connection.connectionId,
        createdAt: now,
        status: SyncStatus.PROCESSING
      })

      walletOne = {
        accounts: [],
        clientId: connection.clientId,
        connections: [toConnectionAssociation(connection)],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        externalId: 'external-id-one',
        label: 'wallet one',
        provider: connection.provider,
        updatedAt: now,
        walletId: randomUUID()
      }
      walletTwo = {
        accounts: [],
        clientId: connection.clientId,
        connections: [toConnectionAssociation(connection)],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        externalId: 'external-id-two',
        label: 'wallet two',
        provider: connection.provider,
        updatedAt: now,
        walletId: randomUUID()
      }

      accountOne = {
        accountId: randomUUID(),
        addresses: [],
        clientId: connection.clientId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        externalId: 'account-external-id-one',
        label: 'accoutn one',
        networkId: 'BTC',
        provider: Provider.ANCHORAGE,
        updatedAt: now,
        walletId: walletOne.walletId
      }
      accountTwo = {
        accountId: randomUUID(),
        addresses: [],
        clientId: connection.clientId,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        externalId: 'account-external-id-two',
        label: 'accoutn two',
        networkId: 'BTC',
        provider: Provider.ANCHORAGE,
        updatedAt: now,
        walletId: walletOne.walletId
      }

      addressOne = {
        accountId: accountOne.accountId,
        address: 'address-one',
        addressId: randomUUID(),
        clientId: connection.clientId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        externalId: 'address-one-external-id',
        provider: Provider.ANCHORAGE,
        updatedAt: now
      }
      addressTwo = {
        accountId: accountOne.accountId,
        address: 'address-two',
        addressId: randomUUID(),
        clientId: connection.clientId,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        externalId: 'address-two-external-id',
        provider: Provider.ANCHORAGE,
        updatedAt: now
      }

      kdOne = {
        address: 'known-destination-one-address',
        assetId: 'USDC',
        clientId,
        connections: [toConnectionAssociation(connection)],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        externalClassification: null,
        externalId: 'known-destination-one-external-id',
        knownDestinationId: randomUUID(),
        label: 'known destination one',
        networkId: 'ETH',
        provider: Provider.ANCHORAGE,
        updatedAt: now
      }
      kdTwo = {
        address: 'known-destination-two-address',
        assetId: 'USDC',
        clientId,
        connections: [toConnectionAssociation(connection)],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        externalClassification: null,
        externalId: 'known-destination-two-external-id',
        knownDestinationId: randomUUID(),
        label: 'known destination two',
        networkId: 'ETH',
        provider: Provider.ANCHORAGE,
        updatedAt: now
      }
    })

    it('creates wallets', async () => {
      const operations: SyncResult = {
        wallets: [
          { type: SyncOperationType.CREATE, create: walletOne },
          { type: SyncOperationType.CREATE, create: walletTwo }
        ],
        accounts: [],
        addresses: [],
        knownDestinations: []
      }

      await syncService.execute(sync, operations)

      const { data: wallets } = await walletService.findAll(clientId)

      expect(wallets).toEqual([walletTwo, walletOne])
    })

    it('updates wallets', async () => {
      await walletService.bulkCreate([walletOne, walletTwo])

      const operations: SyncResult = {
        wallets: [
          {
            type: SyncOperationType.UPDATE,
            update: {
              ...walletTwo,
              label: 'updated wallet label'
            }
          }
        ],
        accounts: [],
        addresses: [],
        knownDestinations: []
      }

      await syncService.execute(sync, operations)

      const updatedWallet = await walletService.findById(clientId, walletTwo.walletId)

      expect(updatedWallet.label).toEqual('updated wallet label')
    })

    it.todo('deletes wallets')

    it('creates accounts', async () => {
      const operations: SyncResult = {
        wallets: [{ type: SyncOperationType.CREATE, create: walletOne }],
        accounts: [
          { type: SyncOperationType.CREATE, create: accountOne },
          { type: SyncOperationType.CREATE, create: accountTwo }
        ],
        addresses: [],
        knownDestinations: []
      }

      await syncService.execute(sync, operations)

      const { data: accounts } = await accountService.findAll(clientId)

      expect(accounts).toEqual([accountTwo, accountOne])
    })

    it('update accounts', async () => {
      await walletService.bulkCreate([walletOne])
      await accountService.bulkCreate([accountOne, accountTwo])

      const operations: SyncResult = {
        wallets: [],
        accounts: [
          {
            type: SyncOperationType.UPDATE,
            update: {
              ...accountOne,
              label: 'updated account label'
            }
          }
        ],
        addresses: [],
        knownDestinations: []
      }

      await syncService.execute(sync, operations)

      const updatedAccount = await accountService.findById(clientId, accountOne.accountId)

      expect(updatedAccount.label).toEqual('updated account label')
    })

    it.todo('deletes accounts')

    it('creates addresses', async () => {
      const operations: SyncResult = {
        wallets: [{ type: SyncOperationType.CREATE, create: walletOne }],
        accounts: [{ type: SyncOperationType.CREATE, create: accountOne }],
        addresses: [
          { type: SyncOperationType.CREATE, create: addressOne },
          { type: SyncOperationType.CREATE, create: addressTwo }
        ],
        knownDestinations: []
      }

      await syncService.execute(sync, operations)

      const { data: addresses } = await addressService.findAll(clientId)

      expect(addresses).toEqual([addressTwo, addressOne])
    })

    it.todo('deletes addresses')

    it('creates known destinations', async () => {
      const operations: SyncResult = {
        wallets: [],
        accounts: [],
        addresses: [],
        knownDestinations: [
          { type: SyncOperationType.CREATE, create: kdOne },
          { type: SyncOperationType.CREATE, create: kdTwo }
        ]
      }

      await syncService.execute(sync, operations)

      const { data: knownDestinations } = await knownDestinationService.findAll(clientId)

      expect(knownDestinations).toEqual([kdTwo, kdOne])
    })

    it('updates known destinations', async () => {
      await knownDestinationService.bulkCreate([kdOne, kdTwo])

      const operations: SyncResult = {
        wallets: [],
        accounts: [],
        addresses: [],
        knownDestinations: [
          {
            type: SyncOperationType.UPDATE,
            update: {
              ...kdTwo,
              label: 'updated kown destination label'
            }
          }
        ]
      }

      await syncService.execute(sync, operations)

      const updatedKd = await knownDestinationService.findById(clientId, kdTwo.knownDestinationId)

      expect(updatedKd.label).toEqual('updated kown destination label')
    })

    it('deletes known destinations', async () => {
      await knownDestinationService.bulkCreate([kdOne, kdTwo])

      const operations: SyncResult = {
        wallets: [],
        accounts: [],
        addresses: [],
        knownDestinations: [
          { type: SyncOperationType.DELETE, entityId: kdOne.knownDestinationId },
          { type: SyncOperationType.DELETE, entityId: kdTwo.knownDestinationId }
        ]
      }

      await syncService.execute(sync, operations)

      const { data: knownDestinations } = await knownDestinationService.findAll(clientId)

      expect(knownDestinations).toEqual([])
    })

    it('completes sync on success', async () => {
      const operations: SyncResult = {
        wallets: [],
        accounts: [],
        addresses: [],
        knownDestinations: []
      }
      const successfulSync = await syncService.execute(sync, operations)

      expect(successfulSync).toMatchObject({
        completedAt: expect.any(Date),
        status: SyncStatus.SUCCESS
      })
    })

    it('fails sync on error', async () => {
      const operations: SyncResult = {
        wallets: [{ type: SyncOperationType.CREATE, create: {} as unknown as Wallet }],
        accounts: [],
        addresses: [],
        knownDestinations: []
      }
      const failedSync = await syncService.execute(sync, operations)

      expect(failedSync).toMatchObject({
        completedAt: expect.any(Date),
        status: SyncStatus.FAILED,
        error: {
          name: expect.any(String),
          message: expect.any(String),
          traceId: undefined
        }
      })
    })
  })
})
