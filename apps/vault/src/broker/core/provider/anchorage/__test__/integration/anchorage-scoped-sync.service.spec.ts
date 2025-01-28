import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'
import { VaultTest } from '../../../../../../__test__/shared/vault.test'
import { ClientService } from '../../../../../../client/core/service/client.service'
import { MainModule } from '../../../../../../main.module'
import { ProvisionService } from '../../../../../../provision.service'
import { TestPrismaService } from '../../../../../../shared/module/persistence/service/test-prisma.service'
import { testClient } from '../../../../../__test__/util/mock-data'
import { NetworkSeed } from '../../../../../persistence/seed/network.seed'
import { setupMockServer } from '../../../../../shared/__test__/mock-server'
import { AccountService } from '../../../../service/account.service'
import { AddressService } from '../../../../service/address.service'
import { ConnectionService } from '../../../../service/connection.service'
import { WalletService } from '../../../../service/wallet.service'
import { ConnectionWithCredentials } from '../../../../type/connection.type'
import { Provider, isCreateOperation } from '../../../../type/provider.type'
import { AnchorageScopedSyncService } from '../../anchorage-scoped-sync.service'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../server-mock/server'

describe(AnchorageScopedSyncService.name, () => {
  let app: INestApplication
  let module: TestingModule

  let anchorageScopedSyncService: AnchorageScopedSyncService
  let clientService: ClientService
  let connection: ConnectionWithCredentials
  let walletService: WalletService
  let accountService: AccountService
  let addressService: AddressService
  let connectionService: ConnectionService
  let networkSeed: NetworkSeed
  let provisionService: ProvisionService
  let testPrismaService: TestPrismaService

  setupMockServer(getHandlers())

  const clientId = 'test-client-id'

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    anchorageScopedSyncService = module.get(AnchorageScopedSyncService)
    connectionService = module.get(ConnectionService)
    walletService = module.get(WalletService)
    accountService = module.get(AccountService)
    addressService = module.get(AddressService)
    provisionService = module.get(ProvisionService)
    networkSeed = module.get(NetworkSeed)
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

    await networkSeed.seed()

    await app.init()
  })

  describe('scoped-syncs', () => {
    it('returns scoped sync operations for wallets, accounts and addresses based on an anchorage wallet externalId', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: '6a46a1977959e0529f567e8e927e3895'
        }
      ]
      const sync = await anchorageScopedSyncService.scopedSync(connection, rawAccounts)

      expect(sync.wallets.length).toBe(1)
      expect(sync.accounts.length).toBe(1)
      expect(sync.addresses.length).toBe(1)
    })

    // TODO @ptroger: revert that back to 'return empty array' when we completely move towards the scoped connections
    it('returns full connection sync when empty rawAccounts are provided', async () => {
      const sync = await anchorageScopedSyncService.scopedSync(connection, [])

      expect(sync.wallets.length).toBe(2)
      expect(sync.accounts.length).toBe(18)
      expect(sync.addresses.length).toBe(2)
    })

    it('returns empty array when no wallets are found for the provided rawAccounts', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: 'notFound'
        }
      ]
      const sync = await anchorageScopedSyncService.scopedSync(connection, rawAccounts)

      expect(sync.wallets.length).toBe(0)
      expect(sync.accounts.length).toBe(0)
      expect(sync.addresses.length).toBe(0)
    })
    it('skips duplicate for the same connection', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: '6a46a1977959e0529f567e8e927e3895'
        }
      ]
      const firstSync = await anchorageScopedSyncService.scopedSync(connection, rawAccounts)

      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))
      await accountService.bulkCreate(firstSync.accounts.filter(isCreateOperation).map(({ create }) => create))
      await addressService.bulkCreate(firstSync.addresses.filter(isCreateOperation).map(({ create }) => create))

      const secondSync = await anchorageScopedSyncService.scopedSync(connection, rawAccounts)

      expect(secondSync.wallets.length).toBe(0)
      expect(secondSync.accounts.length).toBe(0)
      expect(secondSync.addresses.length).toBe(0)
    })

    it('duplicates for different connections', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: '6a46a1977959e0529f567e8e927e3895'
        }
      ]
      const firstSync = await anchorageScopedSyncService.scopedSync(connection, rawAccounts)

      await walletService.bulkCreate(firstSync.wallets.filter(isCreateOperation).map(({ create }) => create))
      await accountService.bulkCreate(firstSync.accounts.filter(isCreateOperation).map(({ create }) => create))
      await addressService.bulkCreate(firstSync.addresses.filter(isCreateOperation).map(({ create }) => create))

      const secondConnection = await connectionService.create(clientId, {
        connectionId: uuid(),
        provider: Provider.ANCHORAGE,
        url: ANCHORAGE_TEST_API_BASE_URL,
        label: 'test active connection',
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const secondSync = await anchorageScopedSyncService.scopedSync(secondConnection, rawAccounts)

      expect(secondSync.wallets.length).toBe(1)
      expect(secondSync.accounts.length).toBe(1)
      expect(secondSync.addresses.length).toBe(1)
    })
  })
})
