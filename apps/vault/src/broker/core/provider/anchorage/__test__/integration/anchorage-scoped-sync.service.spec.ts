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
import { ConnectionService } from '../../../../service/connection.service'
import { NetworkService } from '../../../../service/network.service'
import { ConnectionWithCredentials } from '../../../../type/connection.type'
import { Provider } from '../../../../type/provider.type'
import { RawAccountError } from '../../../../type/scoped-sync.type'
import { AnchorageScopedSyncService } from '../../anchorage-scoped-sync.service'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../server-mock/server'

describe(AnchorageScopedSyncService.name, () => {
  let app: INestApplication
  let module: TestingModule

  let anchorageScopedSyncService: AnchorageScopedSyncService
  let clientService: ClientService
  let connection: ConnectionWithCredentials
  let networkService: NetworkService
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
    networkService = module.get(NetworkService)
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
      const networks = await networkService.buildProviderExternalIdIndex(Provider.ANCHORAGE)

      const sync = await anchorageScopedSyncService.scopeSync({
        connection,
        rawAccounts,
        networks,
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(1)
      expect(sync.accounts.length).toBe(1)
      expect(sync.addresses.length).toBe(1)
    })

    // TODO @ptroger: revert that back to 'return empty array' when we completely move towards the scoped connections
    it('returns full connection sync when empty rawAccounts are provided', async () => {
      const networks = await networkService.buildProviderExternalIdIndex(Provider.ANCHORAGE)

      const sync = await anchorageScopedSyncService.scopeSync({
        connection,
        rawAccounts: [],
        networks,
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(2)
      expect(sync.accounts.length).toBe(18)
      expect(sync.addresses.length).toBe(18)
    })

    it('adds failure when external resource is not found', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: 'notFound'
        }
      ]
      const networks = await networkService.buildProviderExternalIdIndex(Provider.ANCHORAGE)

      const sync = await anchorageScopedSyncService.scopeSync({
        connection,
        rawAccounts,
        networks,
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(0)
      expect(sync.accounts.length).toBe(0)
      expect(sync.addresses.length).toBe(0)
      expect(sync.failures).toEqual([
        {
          rawAccount: rawAccounts[0],
          message: 'Anchorage wallet not found',
          code: RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND,
          externalResourceType: 'wallet',
          externalResourceId: rawAccounts[0].externalId
        }
      ])
    })

    it('adds failure when network is not found in our list', async () => {
      const rawAccounts = [
        {
          provider: Provider.ANCHORAGE,
          externalId: '6a46a1977959e0529f567e8e927e3895'
        }
      ]

      const sync = await anchorageScopedSyncService.scopeSync({
        connection,
        rawAccounts,
        networks: new Map(),
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(0)
      expect(sync.accounts.length).toBe(0)
      expect(sync.addresses.length).toBe(0)
      expect(sync.failures).toEqual([
        {
          rawAccount: rawAccounts[0],
          message: 'Network for this account is not supported',
          code: RawAccountError.UNLISTED_NETWORK,
          networkId: 'BTC_S'
        }
      ])
    })
  })
})
