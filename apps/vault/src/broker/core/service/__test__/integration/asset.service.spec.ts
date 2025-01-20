import { ConfigModule } from '@narval/config-module'
import { LoggerModule } from '@narval/nestjs-shared'
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
import { TransferAsset } from '../../../type/transfer.type'
import { AssetService } from '../../asset.service'

describe(AssetService.name, () => {
  let testPrismaService: TestPrismaService
  let assetService: AssetService
  let networkRepository: NetworkRepository

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
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [AssetService, AssetRepository, NetworkRepository]
    }).compile()

    testPrismaService = module.get(TestPrismaService)
    assetService = module.get(AssetService)
    networkRepository = module.get(NetworkRepository)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await networkRepository.bulkCreate([ethereum])
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

  describe('findTransferAsset', () => {
    const baseTransferAsset: TransferAsset = {
      assetId: usdc.assetId
    }

    beforeEach(async () => {
      await assetService.bulkCreate([usdc])
    })

    it('finds by provider and externalId when externalAssetId is present', async () => {
      const result = await assetService.findTransferAsset(Provider.FIREBLOCKS, {
        ...baseTransferAsset,
        externalAssetId: 'USDC'
      })

      expect(result).toEqual({
        ...usdc,
        createdAt: expect.any(Date)
      })
    })

    it('finds by assetId when present', async () => {
      const result = await assetService.findTransferAsset(Provider.FIREBLOCKS, {
        ...baseTransferAsset
      })

      expect(result).toEqual({
        ...usdc,
        createdAt: expect.any(Date)
      })
    })

    it('finds by onchainId when address and networkId are set', async () => {
      const result = await assetService.findTransferAsset(Provider.FIREBLOCKS, {
        address: usdc.onchainId as string,
        networkId: ethereum.networkId
      })

      expect(result).toEqual({
        ...usdc,
        createdAt: expect.any(Date)
      })
    })

    it('finds native asset when only networkId is set', async () => {
      const nativeEth: Asset = {
        assetId: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        networkId: ethereum.networkId,
        onchainId: null,
        externalAssets: []
      }
      await assetService.bulkCreate([nativeEth])

      const result = await assetService.findTransferAsset(Provider.FIREBLOCKS, {
        networkId: ethereum.networkId
      })

      expect(result).toEqual({
        ...nativeEth,
        createdAt: expect.any(Date)
      })
    })

    it('throws AssetException when address is set but networkId is not', async () => {
      await expect(
        assetService.findTransferAsset(Provider.FIREBLOCKS, {
          address: usdc.onchainId as string
        })
      ).rejects.toThrow(AssetException)
    })
  })
})
