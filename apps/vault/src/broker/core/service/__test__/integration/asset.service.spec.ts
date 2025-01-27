import { ConfigModule } from '@narval/config-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { CacheModule } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/vault/runtime/library'
import { load } from '../../../../../main.config'
import { AppModule } from '../../../../../main.module'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { AssetRepository } from '../../../../persistence/repository/asset.repository'
import { NetworkRepository } from '../../../../persistence/repository/network.repository'
import { AssetException } from '../../../exception/asset.exception'
import { Asset } from '../../../type/asset.type'
import { Network } from '../../../type/network.type'
import { Provider } from '../../../type/provider.type'
import { AssetService } from '../../asset.service'
import { NetworkService } from '../../network.service'

describe(AssetService.name, () => {
  let testPrismaService: TestPrismaService
  let assetService: AssetService
  let networkService: NetworkService

  const ethereum: Network = {
    networkId: 'ETHEREUM',
    coinType: 60,
    name: 'Ethereum',
    externalNetworks: []
  }

  const usdc: Asset = {
    assetId: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    networkId: ethereum.networkId,
    onchainId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    externalAssets: [
      {
        provider: Provider.FIREBLOCKS,
        externalId: 'USDC'
      }
    ]
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        PersistenceModule.register({ imports: [] }),
        CacheModule.register(),
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [AssetService, AssetRepository, NetworkService, NetworkRepository]
    }).compile()

    testPrismaService = module.get(TestPrismaService)
    assetService = module.get(AssetService)
    networkService = module.get(NetworkService)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await networkService.bulkCreate([ethereum])
  })

  describe('bulkCreate', () => {
    it('creates asset with lowercase onchainId', async () => {
      const asset: Asset = {
        ...usdc,
        onchainId: '0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
        externalAssets: []
      }

      const created = await assetService.bulkCreate([asset])

      expect(created[0].onchainId).toEqual(asset.onchainId?.toLowerCase())
    })

    it('throws AssetException when native asset already exists', async () => {
      const eth: Asset = {
        assetId: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        networkId: ethereum.networkId,
        onchainId: null,
        externalAssets: []
      }

      await assetService.bulkCreate([eth])

      // NOTE: What makes ETH a native asset is the networkId and onchainId
      // being null.
      const duplicateEth: Asset = {
        ...eth,
        assetId: 'ETH_2'
      }

      await expect(assetService.bulkCreate([duplicateEth])).rejects.toThrow(AssetException)
    })

    it('throws PrismaClientKnownRequestError when networkId and onchainId already exists', async () => {
      await assetService.bulkCreate([usdc])

      // NOTE: Invariant protected by a unique key in the database.
      await expect(assetService.bulkCreate([usdc])).rejects.toThrow(PrismaClientKnownRequestError)
    })
  })
})
