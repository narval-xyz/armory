import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
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
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { ActiveConnectionWithCredentials, Provider } from '../../../type/connection.type'
import { Account } from '../../../type/indexed-resources.type'
import { AccountService } from '../../account.service'
import { AddressService } from '../../address.service'
import { AnchorageSyncService } from '../../anchorage-sync.service'
import { ConnectionService } from '../../connection.service'
import { KnownDestinationService } from '../../known-destination.service'
import { WalletService } from '../../wallet.service'
import { trustedDestinationsHandlers, vaultHandlers } from './mocks/anchorage/handlers'
import { ANCHORAGE_TEST_API_BASE_URL, setupMockServer } from './mocks/anchorage/server'

describe(AnchorageSyncService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let anchorageSyncService: AnchorageSyncService
  let connectionService: ConnectionService
  let connection: ActiveConnectionWithCredentials
  let walletService: WalletRepository
  let accountService: AccountService
  let addressService: AddressService
  let knownDestinationService: KnownDestinationService
  let provisionService: ProvisionService
  let clientService: ClientService

  const server = setupMockServer()

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
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)

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

  describe('syncWallets', () => {
    it('fetches anchorage vaults and persist them as wallets', async () => {
      const { created } = await anchorageSyncService.syncWallets(connection)

      const { data: wallets } = await walletService.findAll(connection.clientId)
      expect(created).toEqual(expect.arrayContaining(wallets))
    })

    it('does not duplicate wallets', async () => {
      const [first, second] = await Promise.all([
        await anchorageSyncService.syncWallets(connection),
        await anchorageSyncService.syncWallets(connection)
      ])

      expect(first.created.length).toEqual(2)
      expect(second.created.length).toEqual(0)
    })

    it('connects wallet with the new connection', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials: firstCredentials, ...firstConnection } = connection
      const secondConnectionWithCredentials = await connectionService.create(clientId, {
        connectionId: uuid(),
        provider: Provider.ANCHORAGE,
        url: ANCHORAGE_TEST_API_BASE_URL,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials: secondCredentials, ...secondConnection } = secondConnectionWithCredentials

      // First sync - should create all wallets
      server.use(vaultHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)
      await anchorageSyncService.syncWallets(connection)

      // Second sync with new connection that only finds one wallet and its label is changed
      server.use(vaultHandlers(ANCHORAGE_TEST_API_BASE_URL).update)
      const { updated } = await anchorageSyncService.syncWallets(secondConnectionWithCredentials)

      expect(updated).toHaveLength(1)
      expect(updated[0]).toMatchObject({
        externalId: '084ff57c0984420efac31723579c94fc',
        label: 'Vault 1 - renamed',
        connections: [firstConnection, secondConnection]
      })

      // Verify other destinations weren't affected
      const { data: allDestinations } = await walletService.findAll(connection.clientId)
      const unchangedDestinations = allDestinations.filter((d) => d.externalId !== '084ff57c0984420efac31723579c94fc')
      unchangedDestinations.forEach((dest) => {
        expect(dest.connections).toEqual([firstConnection])
      })
    })
  })

  describe('syncAccounts', () => {
    const sortByExternalId = (a: Account, b: Account) => a.externalId.localeCompare(b.externalId)

    it('fetches anchorage wallets and persist them as accounts', async () => {
      await anchorageSyncService.syncWallets(connection)

      const syncedAccounts = await anchorageSyncService.syncAccounts(connection)

      const { data: accounts } = await accountService.findAll(connection.clientId)

      expect(syncedAccounts.sort(sortByExternalId)).toEqual(accounts.sort(sortByExternalId))
    })

    it('does not duplicate accounts', async () => {
      await anchorageSyncService.syncWallets(connection)

      const [first, second] = await Promise.all([
        await anchorageSyncService.syncAccounts(connection),
        await anchorageSyncService.syncAccounts(connection)
      ])

      expect(first.length).toEqual(18)
      expect(second.length).toEqual(0)
    })
  })

  describe('syncAddresses', () => {
    beforeEach(async () => {
      await anchorageSyncService.syncWallets(connection)
      await anchorageSyncService.syncAccounts(connection)
    })

    it('fetches anchorage addresses and persist them as addresses', async () => {
      const syncedAddresses = await anchorageSyncService.syncAddresses(connection)

      const { data: addresses } = await addressService.findAll(connection.clientId)

      expect(syncedAddresses).toEqual(
        addresses.map((address) => ({
          ...address,
          addressId: expect.any(String)
        }))
      )
    })

    it('does not duplicate addresses', async () => {
      const [first, second] = await Promise.all([
        await anchorageSyncService.syncAddresses(connection),
        await anchorageSyncService.syncAddresses(connection)
      ])

      expect(first.length).toEqual(1)
      expect(second.length).toEqual(0)
    })
  })

  describe('syncKnownDestinations', () => {
    it('fetches anchorage addresses and persist them as knownDestinations', async () => {
      const { created } = await anchorageSyncService.syncKnownDestinations(connection)
      const { data: knownDestinations } = await knownDestinationService.findAll(connection.clientId)

      expect(created).toEqual(expect.arrayContaining(knownDestinations))
    })

    it('updates anchorage knownDestination when it already exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials, ...expectedConnection } = connection

      // First sync - create initial destinations
      server.use(trustedDestinationsHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)
      await anchorageSyncService.syncKnownDestinations(connection)

      const { data: initialDestinations } = await knownDestinationService.findAll(connection.clientId)
      // Second sync with updated data
      server.use(trustedDestinationsHandlers(ANCHORAGE_TEST_API_BASE_URL).deleteAndUpdate)
      const { created, updated, deleted } = await anchorageSyncService.syncKnownDestinations(connection)

      // Verify basic operations
      expect(created).toEqual([])
      expect(deleted).toEqual(1)

      // Only the modified destination should be in updated
      expect(updated).toHaveLength(1)
      expect(updated[0]).toMatchObject({
        externalId: 'toBeUpdated',
        address: '0x8Bc2B8F33e5AeF847B8973Fa669B948A3028D6bd',
        label: 'new memo',
        assetId: 'USDC',
        networkId: 'ETH',
        connections: expect.arrayContaining([expectedConnection])
      })

      // Verify the update timestamp is newer
      expect(updated[0].updatedAt.getTime()).toBeGreaterThan(updated[0].createdAt.getTime())

      // Verify other destinations weren't affected
      const { data: allDestinations } = await knownDestinationService.findAll(connection.clientId)
      const unchangedDestination = allDestinations.find((d) => d.externalId === 'neverChanges')
      const initialUnchangedDestination = initialDestinations.find((d) => d.externalId === 'neverChanges')
      expect(unchangedDestination).toEqual(initialUnchangedDestination)
    })

    it('connects known-destination with the new connection', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials, ...firstConnection } = connection
      const secondConnectionWithCredentials = await connectionService.create(clientId, {
        connectionId: uuid(),
        provider: Provider.ANCHORAGE,
        url: ANCHORAGE_TEST_API_BASE_URL,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials: secondCredentials, ...secondConnection } = secondConnectionWithCredentials

      // First sync - should create all destinations
      server.use(trustedDestinationsHandlers(ANCHORAGE_TEST_API_BASE_URL).findAll)
      await anchorageSyncService.syncKnownDestinations(connection)

      // Second sync with new connection that only finds one destination
      server.use(trustedDestinationsHandlers(ANCHORAGE_TEST_API_BASE_URL).connect)
      const { updated } = await anchorageSyncService.syncKnownDestinations(secondConnectionWithCredentials)

      // We expect only one item to be updated - the one with connections to both accounts
      expect(updated).toHaveLength(1)
      expect(updated[0]).toMatchObject({
        externalId: 'toBeConnected',
        connections: [firstConnection, secondConnection]
      })

      // Verify other destinations weren't affected
      const { data: allDestinations } = await knownDestinationService.findAll(connection.clientId)
      const unchangedDestinations = allDestinations.filter((d) => d.externalId !== 'toBeConnected')
      unchangedDestinations.forEach((dest) => {
        expect(dest.connections).toEqual([firstConnection])
      })
    })
  })
})
