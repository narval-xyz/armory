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
import {
  FIREBLOCKS_TEST_API_BASE_URL,
  getHandlers,
  getVaultAccountHandlers
} from '../../../fireblocks/__test__/server-mock/server'
import { FireblocksScopedSyncService } from '../../fireblocks-scoped-sync.service'
import { buildFireblocksAssetWalletExternalId } from '../../fireblocks.util'

describe(FireblocksScopedSyncService.name, () => {
  let app: INestApplication
  let module: TestingModule

  let fireblocksScopedSyncService: FireblocksScopedSyncService
  let clientService: ClientService
  let connection: ConnectionWithCredentials
  let connectionService: ConnectionService
  let networkSeed: NetworkSeed
  let networkService: NetworkService
  let provisionService: ProvisionService
  let testPrismaService: TestPrismaService

  const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDVORyUbWt/yuW4
29mXtJBC3PEisQN3BQhtKp6jHa89YeWBct43g6tUTwcvdj7HXJOmp1FLbbPzE/pe
HMHtlx2ZTHIcz2nU4c4k6PiN//xGHze7aY8e3G+tVSJLQKRBFXiXWuUjDM5/OYWj
YwCjJptulOjzU6zwc/LW0KNBYQb4VuElJeV2mp17YOwUaLxyR+1I2+6aN5wCK8+M
VHHbo5y4nSNUClK0TdAWP3ZKu6DKZveKCmbY5X3V/mVS52LgvFlVHrSLMUQUkH1Y
ob4vBcw4QT7lAcyo4YKno1Q8mZKNivkWMpw+6R3c2hjPzHdiqYjPkPiMPDC6hJGi
7rh2iG3jAgMBAAECggEAB7wyKrpLd4/bRJkJLEU7JInSX6FPUF6I3zj4F0/I3y+x
fUA3ComGyiCx0Il4HpBftOCGBPf+WrejUg22BVIBm2GYFC58FuJ4MYOYHMKoGr0g
LvbV39c8X+viOhumucu3G7qK7HoW9auXCwXY7JJGej0BtG4ZLIHwUdWwznrgH1sq
ig/mdHy3SWVl0/c7PbLaD+IoHLqVmGgq4ylDdRyNfbvjLFzDptaois0kfZ0JMTF8
+l0n30ib3Vmv1T/sZaLKj33LY7moQHk/FYp4uAP/5CAfSJQaUWQDDrc3WN7LwE0o
ALeIfAN2KltEcTouCDgBqTD5y72c6IsAIyDlkOxX/QKBgQDysS48botXSH3dF8/2
gxRhVqYYGx2mU6pqQDOQk8z0Cg5qjs5H7U+xSX1vyaGNfPLKrMXLjJSDKtKT5TN1
sHXHKjL88I5gGODf4vJncCD7m5wTt1JPzm4mIVZcLILmD3buAn8qMXz64i4tus1e
heVJZBUt360B/iEsJtlS7WsZLwKBgQDg6kGT/jBa6hP5JKVZWbyk5tOxCZsHSaNx
iXzSmKX6bld+b9qlxBsZGOs74lSeSaps8pLO0+Hy+WRvnJF0UNPSJpNT8ppHaHBn
KPWtX1yPj+JWqHLSx5JgsxCAiHSAHpRcR0Yh77WpAHCAstYm+pa2tCZ1sbzSOa3j
jz8L3FuhjQKBgBYTCZqTj3cD7/bROKg6afskj3z30m2ThJefeVE4MFcuJvuIO7kN
G8eLYK5vT5N3/vlyV5dZFRUNKxQqr9CPmVbhPrwFAV46RRH4KYZBC673C247qW/6
3cf4FkvR/KICXBXwAjMLR0vmkL62FAH5+c4AHXELvEfHHqtOaUwCrlAfAoGBAJ9u
br3xWWWYuD/Lcko8CjT6SuUb4gDweiNpSkoeWsmCnhLKRztqH6tStqzkawcpQN2p
tddW6rvJfSCA47qH8R7uqVDAkAw+RC9cIYqcJoi9fbvf/ETdoy1YwUHbeHm5M4GW
JGi5+xOpdBZGrvdCesNYQEr9itOaf2DnkdFeirWhAoGAMlyskZWy2EW9T4tJgxVz
474FlWrtmVZNXMHO8pgd++JrR8Tgb1maoxENNsIxcWwMRgGLL0FA7sGf+wcxQjHT
l6Yb3VB/SnVMOOLTsE1SvCywjJ8vl8tEmbCoTFlDCJHh+IEB5a2NC4403tL7yPWS
iYDlTZ/pWsEotE2yCl/8krs=
-----END PRIVATE KEY-----`

  const privateKey = Buffer.from(privateKeyPem).toString('base64')

  const clientId = 'test-client-id'

  const mockServer = setupMockServer(getHandlers())

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    fireblocksScopedSyncService = module.get(FireblocksScopedSyncService)
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
      provider: Provider.FIREBLOCKS,
      url: FIREBLOCKS_TEST_API_BASE_URL,
      label: 'test active connection',
      credentials: {
        apiKey: 'test-api-key',
        privateKey
      }
    })

    await networkSeed.seed()

    await app.init()
  })

  describe('scoped-syncs', () => {
    it('returns scoped sync operations for wallets, accounts and addresses based on an fireblocks wallet externalId', async () => {
      const rawAccounts = [
        {
          provider: Provider.FIREBLOCKS,
          externalId: buildFireblocksAssetWalletExternalId({ vaultId: '3', networkId: 'ETH' })
        }
      ]

      const networks = await networkService.buildProviderExternalIdIndex(Provider.FIREBLOCKS)
      const sync = await fireblocksScopedSyncService.scopeSync({
        connection,
        rawAccounts,
        networks,
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(1)
      expect(sync.accounts.length).toBe(1)
      expect(sync.addresses.length).toBe(1)
    })

    it('returns empty objects when no rawAccounts are provided', async () => {
      const networks = await networkService.buildProviderExternalIdIndex(Provider.FIREBLOCKS)

      const sync = await fireblocksScopedSyncService.scopeSync({
        connection,
        rawAccounts: [],
        networks,
        existingAccounts: []
      })

      expect(sync.wallets.length).toBe(0)
      expect(sync.accounts.length).toBe(0)
      expect(sync.addresses.length).toBe(0)
    })

    it('adds failure when external resource is not found', async () => {
      mockServer.use(getVaultAccountHandlers(FIREBLOCKS_TEST_API_BASE_URL).invalid)
      const rawAccounts = [
        {
          provider: Provider.FIREBLOCKS,
          externalId: buildFireblocksAssetWalletExternalId({ vaultId: 'notfound', networkId: 'ETH' })
        }
      ]
      const networks = await networkService.buildProviderExternalIdIndex(Provider.FIREBLOCKS)

      const sync = await fireblocksScopedSyncService.scopeSync({
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
          message: 'Fireblocks Vault Account not found',
          code: RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND,
          externalResourceType: 'vaultAccount',
          externalResourceId: 'NOTFOUND'
        }
      ])
    })

    it('adds failure when network is not found in our list', async () => {
      const rawAccounts = [
        {
          provider: Provider.FIREBLOCKS,
          externalId: buildFireblocksAssetWalletExternalId({ vaultId: '3', networkId: 'notFound' })
        }
      ]
      const networks = await networkService.buildProviderExternalIdIndex(Provider.FIREBLOCKS)

      const sync = await fireblocksScopedSyncService.scopeSync({
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
          message: 'Network for this account is not supported',
          code: RawAccountError.UNLISTED_NETWORK,
          networkId: 'NOTFOUND'
        }
      ])
    })
  })
})
