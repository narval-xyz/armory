import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../../../../client/core/service/client.service'
import { MainModule } from '../../../../../../main.module'
import { ProvisionService } from '../../../../../../provision.service'
import { KeyValueRepository } from '../../../../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../../../../shared/testing/encryption.testing'
import { testClient } from '../../../../../__test__/util/mock-data'
import { WalletRepository } from '../../../../../persistence/repository/wallet.repository'
import { setupMockServer } from '../../../../../shared/__test__/mock-server'
import { AccountService } from '../../../../service/account.service'
import { AddressService } from '../../../../service/address.service'
import { ConnectionService } from '../../../../service/connection.service'
import { KnownDestinationService } from '../../../../service/known-destination.service'
import { WalletService } from '../../../../service/wallet.service'
import { ConnectionWithCredentials } from '../../../../type/connection.type'
import {
  Provider,
  SyncContext,
  SyncOperationType,
  isCreateOperation,
  isDeleteOperation,
  isFailedOperation,
  isUpdateOperation
} from '../../../../type/provider.type'
import { buildEmptyContext } from '../../../../util/provider-sync.util'
import { AnchorageSyncService } from '../../../anchorage/anchorage-sync.service'
import {
  ANCHORAGE_TEST_API_BASE_URL,
  getHandlers,
  getTrustedDestinationHandlers,
  getVaultHandlers
} from '../server-mock/server'

const toConnectionAssociation = (connection: ConnectionWithCredentials) => ({
  clientId: connection.clientId,
  connectionId: connection.connectionId,
  createdAt: connection.createdAt,
  label: connection.label,
  provider: connection.provider,
  revokedAt: connection.revokedAt,
  status: connection.status,
  updatedAt: connection.updatedAt,
  url: connection.url
})

describe(AnchorageSyncService.name, () => {
  let app: INestApplication
  let module: TestingModule

  let accountService: AccountService
  let addressService: AddressService
  let anchorageSyncService: AnchorageSyncService
  let clientService: ClientService
  let connection: ConnectionWithCredentials
  let connectionService: ConnectionService
  let knownDestinationService: KnownDestinationService
  let provisionService: ProvisionService
  let testPrismaService: TestPrismaService
  let walletService: WalletRepository

  const mockServer = setupMockServer(getHandlers())

  const clientId = 'test-client-id'

  const now = new Date()

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
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    anchorageSyncService = module.get(AnchorageSyncService)
    connectionService = module.get(ConnectionService)
    walletService = module.get(WalletService)
    accountService = module.get(AccountService)
    addressService = module.get(AddressService)
    knownDestinationService = module.get(KnownDestinationService)
    provisionService = module.get(ProvisionService)
    clientService = module.get(ClientService)

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
      label: 'test active connection',
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    await app.init()
  })

  describe('sync', () => {
    it('returns sync operations for wallets, accounts, addresses and known destinations', async () => {
      const sync = await anchorageSyncService.sync(connection)

      expect(sync.wallets.length).toBeGreaterThan(0)
      expect(sync.accounts.length).toBeGreaterThan(0)
      expect(sync.addresses.length).toBeGreaterThan(0)
      expect(sync.knownDestinations.length).toBeGreaterThan(0)
    })
  })

  describe('syncWallets', () => {
    it('adds create operations into the context', async () => {
      const result = await anchorageSyncService.syncWallets(buildEmptyContext({ connection, now }))

      expect(result.wallets).toEqual([
        {
          type: SyncOperationType.CREATE,
          create: {
            accounts: [],
            clientId: connection.clientId,
            connections: [toConnectionAssociation(connection)],
            createdAt: now,
            externalId: '084ff57c0984420efac31723579c94fc',
            label: 'Vault 1',
            provider: connection.provider,
            updatedAt: now,
            walletId: expect.any(String)
          }
        },
        {
          type: SyncOperationType.CREATE,
          create: {
            accounts: [],
            clientId: connection.clientId,
            connections: [toConnectionAssociation(connection)],
            createdAt: now,
            externalId: '62547351cea99e827bcd43a513c40e7c',
            label: 'Vault 2',
            provider: connection.provider,
            updatedAt: now,
            walletId: expect.any(String)
          }
        }
      ])
    })

    it('skips duplicate wallets', async () => {
      const context = buildEmptyContext({ connection, now })

      const firstSync = await anchorageSyncService.syncWallets(context)
      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))

      const secondSync = await anchorageSyncService.syncWallets(context)

      expect(secondSync.wallets).toHaveLength(0)
    })

    it('adds update operations to associate wallet with a new connection', async () => {
      const secondConnectionWithCredentials = await connectionService.create(clientId, {
        connectionId: 'connection-two-id',
        provider: Provider.ANCHORAGE,
        url: ANCHORAGE_TEST_API_BASE_URL,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      // First sync - should create all wallets
      mockServer.use(getVaultHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)
      const firstSync = await anchorageSyncService.syncWallets(buildEmptyContext({ connection, now }))
      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))

      // Second sync with new connection that only finds one wallet and its
      // label is changed.
      mockServer.use(getVaultHandlers(ANCHORAGE_TEST_API_BASE_URL).update)
      const secondSync = await anchorageSyncService.syncWallets(
        buildEmptyContext({
          connection: secondConnectionWithCredentials,
          now
        })
      )

      expect(secondSync.wallets.filter(isCreateOperation)).toHaveLength(0)
      expect(secondSync.wallets.filter(isUpdateOperation)).toHaveLength(1)
      expect(secondSync.wallets.filter(isDeleteOperation)).toHaveLength(0)
      expect(secondSync.wallets.filter(isFailedOperation)).toHaveLength(0)

      expect(secondSync.wallets.filter(isUpdateOperation)[0]).toEqual({
        type: SyncOperationType.UPDATE,
        update: expect.objectContaining({
          externalId: '084ff57c0984420efac31723579c94fc',
          label: 'Vault 1 - renamed',
          connections: [toConnectionAssociation(connection), toConnectionAssociation(secondConnectionWithCredentials)]
        })
      })
    })
  })

  describe('syncAccounts', () => {
    it('adds create operations into the context', async () => {
      const walletOne = {
        accounts: [],
        clientId: connection.clientId,
        connections: [],
        createdAt: now,
        externalId: '084ff57c0984420efac31723579c94fc',
        label: 'Vault 1',
        provider: connection.provider,
        updatedAt: now,
        walletId: '96e7bdc0-d090-42fe-8aaf-f25c2a752e79'
      }
      const walletTwo = {
        accounts: [],
        clientId: connection.clientId,
        connections: [],
        createdAt: now,
        externalId: '62547351cea99e827bcd43a513c40e7c',
        label: 'Vault 2',
        provider: connection.provider,
        updatedAt: now,
        walletId: 'f22cd7b3-f1af-4312-8c05-25acb7dbb76f'
      }
      const context = buildEmptyContext({
        connection,
        now,
        wallets: [
          { type: SyncOperationType.CREATE, create: walletOne },
          { type: SyncOperationType.CREATE, create: walletTwo }
        ]
      })

      const result = await anchorageSyncService.syncAccounts(context)

      expect(result.accounts.filter(isCreateOperation)).toHaveLength(18)
      expect(result.accounts.filter(isUpdateOperation)).toHaveLength(0)
      expect(result.accounts.filter(isDeleteOperation)).toHaveLength(0)
      expect(result.accounts.filter(isFailedOperation)).toHaveLength(0)

      expect(result.accounts.filter(isCreateOperation)[0]).toEqual({
        type: SyncOperationType.CREATE,
        create: {
          accountId: expect.any(String),
          walletId: walletOne.walletId,
          label: 'secondWalletThroughApi!',
          clientId: connection.clientId,
          provider: Provider.ANCHORAGE,
          addresses: [],
          externalId: '145ff5b10e0e208b9c3adab0a9531f0c',
          createdAt: now,
          updatedAt: now,
          networkId: 'BTC'
        }
      })
    })

    it('skips duplicate accounts', async () => {
      const walletOne = {
        accounts: [],
        clientId: connection.clientId,
        connections: [],
        createdAt: now,
        externalId: '084ff57c0984420efac31723579c94fc',
        label: 'Vault 1',
        provider: connection.provider,
        updatedAt: now,
        walletId: '96e7bdc0-d090-42fe-8aaf-f25c2a752e79'
      }
      const walletTwo = {
        accounts: [],
        clientId: connection.clientId,
        connections: [],
        createdAt: now,
        externalId: '62547351cea99e827bcd43a513c40e7c',
        label: 'Vault 2',
        provider: connection.provider,
        updatedAt: now,
        walletId: 'f22cd7b3-f1af-4312-8c05-25acb7dbb76f'
      }
      const context = buildEmptyContext({
        connection,
        now,
        wallets: [
          { type: SyncOperationType.CREATE, create: walletOne },
          { type: SyncOperationType.CREATE, create: walletTwo }
        ]
      })

      const firstSync = await anchorageSyncService.syncAccounts(context)

      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))
      await accountService.bulkCreate(firstSync.accounts.filter(isCreateOperation).map(({ create }) => create))

      const secondSync = await anchorageSyncService.syncAccounts(context)

      expect(secondSync.accounts).toHaveLength(0)
    })

    it.todo('adds failed operations into the context when it does not found the parent wallet')
  })

  describe('syncAddresses', () => {
    let context: SyncContext

    beforeEach(async () => {
      const walletSyncContext = await anchorageSyncService.syncWallets(
        buildEmptyContext({
          connection,
          now
        })
      )

      context = await anchorageSyncService.syncAccounts(walletSyncContext)
    })

    it('adds create operations into the context', async () => {
      const result = await anchorageSyncService.syncAddresses(context)

      expect(result.addresses.filter(isCreateOperation)).toHaveLength(1)
      expect(result.addresses.filter(isUpdateOperation)).toHaveLength(0)
      expect(result.addresses.filter(isDeleteOperation)).toHaveLength(0)
      expect(result.addresses.filter(isFailedOperation)).toHaveLength(0)

      expect(result.addresses.filter(isCreateOperation)[0]).toEqual({
        type: SyncOperationType.CREATE,
        create: {
          accountId: expect.any(String),
          address: '2N18VkRep3F2z7Ggm8W94nkKdARMfEM3EWa',
          addressId: expect.any(String),
          clientId: connection.clientId,
          createdAt: now,
          externalId: '96bf95f1b59d50d9d1149057e8c0f9fd',
          provider: Provider.ANCHORAGE,
          updatedAt: now
        }
      })
    })

    it('skips duplicate addresses', async () => {
      const walletSyncContext = await anchorageSyncService.syncWallets(
        buildEmptyContext({
          connection,
          now
        })
      )
      const accountSyncContext = await anchorageSyncService.syncAccounts(walletSyncContext)
      const firstSync = await anchorageSyncService.syncAddresses(accountSyncContext)

      expect(firstSync.addresses.length).toBeGreaterThan(0)

      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))
      await accountService.bulkCreate(firstSync.accounts.filter(isCreateOperation).map(({ create }) => create))
      await addressService.bulkCreate(firstSync.addresses.filter(isCreateOperation).map(({ create }) => create))

      const secondSync = await anchorageSyncService.syncAddresses(context)

      expect(secondSync.addresses).toHaveLength(0)
    })

    it.todo('adds failed operations into the context when it does not found the parent account')
  })

  describe('syncKnownDestinations', () => {
    it('adds create operations into the context', async () => {
      const result = await anchorageSyncService.syncKnownDestinations(
        buildEmptyContext({
          connection,
          now
        })
      )

      expect(result.knownDestinations.filter(isCreateOperation)).toHaveLength(4)
      expect(result.knownDestinations.filter(isUpdateOperation)).toHaveLength(0)
      expect(result.knownDestinations.filter(isDeleteOperation)).toHaveLength(0)
      expect(result.knownDestinations.filter(isFailedOperation)).toHaveLength(0)

      expect(result.knownDestinations.filter(isCreateOperation)[0]).toEqual({
        type: SyncOperationType.CREATE,
        create: {
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          assetId: 'ETH',
          clientId,
          connections: [toConnectionAssociation(connection)],
          createdAt: now,
          externalId: 'toBeConnected',
          knownDestinationId: expect.any(String),
          label: undefined,
          networkId: 'ETH',
          provider: Provider.ANCHORAGE,
          updatedAt: now
        }
      })
    })

    it('adds update operations when known destination already exist', async () => {
      const context = buildEmptyContext({ connection, now })

      // First sync, create initial destinations
      mockServer.use(getTrustedDestinationHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)

      const firstSync = await anchorageSyncService.syncKnownDestinations(context)
      await knownDestinationService.bulkCreate(
        firstSync.knownDestinations.filter(isCreateOperation).map(({ create }) => create)
      )

      // Second sync with updated data
      mockServer.use(getTrustedDestinationHandlers(ANCHORAGE_TEST_API_BASE_URL).deleteAndUpdate)
      const secondSync = await anchorageSyncService.syncKnownDestinations(context)

      expect(secondSync.knownDestinations.filter(isCreateOperation)).toHaveLength(0)
      expect(secondSync.knownDestinations.filter(isUpdateOperation)).toHaveLength(1)
      expect(secondSync.knownDestinations.filter(isDeleteOperation)).toHaveLength(1)
      expect(secondSync.knownDestinations.filter(isFailedOperation)).toHaveLength(0)

      // Only the modified destination should be in updated
      expect(secondSync.knownDestinations.filter(isUpdateOperation)[0]).toEqual({
        type: SyncOperationType.UPDATE,
        update: {
          clientId,
          address: '0x8Bc2B8F33e5AeF847B8973Fa669B948A3028D6bd',
          assetId: 'USDC',
          connections: expect.arrayContaining([toConnectionAssociation(connection)]),
          createdAt: now,
          externalClassification: null,
          externalId: 'toBeUpdated',
          knownDestinationId: expect.any(String),
          label: 'new memo',
          networkId: 'ETH',
          provider: Provider.ANCHORAGE,
          updatedAt: now
        }
      })
    })

    it('adds update operations to associate known destinations with a new connection', async () => {
      const secondConnectionWithCredentials = await connectionService.create(clientId, {
        connectionId: uuid(),
        provider: Provider.ANCHORAGE,
        url: ANCHORAGE_TEST_API_BASE_URL,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      // First sync - should create all destinations
      mockServer.use(getTrustedDestinationHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)
      const firstSync = await anchorageSyncService.syncKnownDestinations(
        buildEmptyContext({
          connection,
          now
        })
      )
      await knownDestinationService.bulkCreate(
        firstSync.knownDestinations.filter(isCreateOperation).map(({ create }) => create)
      )

      // Second sync with new connection that only finds one destination
      mockServer.use(getTrustedDestinationHandlers(ANCHORAGE_TEST_API_BASE_URL).connect)

      const secondSync = await anchorageSyncService.syncKnownDestinations(
        buildEmptyContext({
          connection: secondConnectionWithCredentials,
          now
        })
      )

      expect(secondSync.knownDestinations.filter(isCreateOperation)).toHaveLength(0)
      expect(secondSync.knownDestinations.filter(isUpdateOperation)).toHaveLength(1)
      expect(secondSync.knownDestinations.filter(isDeleteOperation)).toHaveLength(3)
      expect(secondSync.knownDestinations.filter(isFailedOperation)).toHaveLength(0)

      expect(secondSync.knownDestinations.filter(isUpdateOperation)[0]).toEqual({
        type: SyncOperationType.UPDATE,
        update: {
          clientId,
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          assetId: 'ETH',
          connections: [toConnectionAssociation(connection), toConnectionAssociation(secondConnectionWithCredentials)],
          createdAt: now,
          externalClassification: null,
          externalId: 'toBeConnected',
          knownDestinationId: expect.any(String),
          label: undefined,
          networkId: 'ETH',
          provider: Provider.ANCHORAGE,
          updatedAt: now
        }
      })
    })
  })
})
