import { ConfigModule } from '@narval/config-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { CacheModule } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
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
import { getExternalAsset } from '../../../util/asset.util'
import { AssetService } from '../../asset.service'
import { NetworkService } from '../../network.service'
import { ResolvedTransferAsset, TransferAssetService } from '../../transfer-asset.service'

describe(TransferAssetService.name, () => {
  let testPrismaService: TestPrismaService
  let assetService: AssetService
  let networkService: NetworkService
  let transferAssetService: TransferAssetService

  const ethereum: Network = {
    networkId: 'ETHEREUM',
    coinType: 60,
    name: 'Ethereum',
    externalNetworks: [
      {
        provider: Provider.FIREBLOCKS,
        externalId: 'FB_ETHEREUM'
      }
    ]
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
        externalId: 'FB_USDC'
      }
    ]
  }

  const usdcOnFireblocks = getExternalAsset(usdc, Provider.FIREBLOCKS)

  const ether: Asset = {
    assetId: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    networkId: ethereum.networkId,
    onchainId: null,
    externalAssets: [
      {
        provider: Provider.FIREBLOCKS,
        externalId: 'FB_ETH'
      }
    ]
  }

  const etherOnFireblocks = getExternalAsset(ether, Provider.FIREBLOCKS)

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
      providers: [AssetService, AssetRepository, NetworkService, NetworkRepository, TransferAssetService]
    }).compile()

    testPrismaService = module.get(TestPrismaService)
    assetService = module.get(AssetService)
    networkService = module.get(NetworkService)
    transferAssetService = module.get(TransferAssetService)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await networkService.bulkCreate([ethereum])
    await assetService.bulkCreate([usdc, ether])
  })

  describe('resolve', () => {
    const baseTransferAsset: TransferAsset = {
      assetId: usdc.assetId
    }

    it('resolves by provider and externalId when externalAssetId is present', async () => {
      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        transferAsset: {
          ...baseTransferAsset,
          externalAssetId: usdcOnFireblocks?.externalId
        }
      })

      expect(resolvedTransferAsset).toEqual({
        network: expect.objectContaining(ethereum),
        assetId: usdc.assetId,
        assetExternalId: usdcOnFireblocks?.externalId
      })
    })

    it('calls fallback when asset is not found by externalId', async () => {
      const unlistedAssetId = 'UNLISTED_ASSET_ID'

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const findByExternalIdFallback = async (_externalAssetId: string): Promise<ResolvedTransferAsset> => {
        return {
          network: ethereum,
          assetId: null,
          assetExternalId: unlistedAssetId
        }
      }

      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        findByExternalIdFallback,
        transferAsset: {
          ...baseTransferAsset,
          externalAssetId: 'UNLISTED_ASSET_ID'
        }
      })

      expect(resolvedTransferAsset).toEqual({
        network: ethereum,
        assetId: null,
        assetExternalId: unlistedAssetId
      })
    })

    it('resolves by assetId when present', async () => {
      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        transferAsset: baseTransferAsset
      })

      expect(resolvedTransferAsset).toEqual({
        network: expect.objectContaining(ethereum),
        assetId: usdc.assetId,
        assetExternalId: usdcOnFireblocks?.externalId
      })
    })

    it('resolves by onchainId when address and networkId are set', async () => {
      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        transferAsset: {
          address: usdc.onchainId as string,
          networkId: ethereum.networkId
        }
      })

      expect(resolvedTransferAsset).toEqual({
        network: expect.objectContaining(ethereum),
        assetId: usdc.assetId,
        assetExternalId: usdcOnFireblocks?.externalId
      })
    })

    it('calls fallback when asset is not found by address and networkId', async () => {
      const unlistedAssetAddress = 'UNLISTED_ASSET_ADDRESS'

      const findByOnchainIdFallback = async (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _network: Network,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _externalAssetId: string
      ): Promise<ResolvedTransferAsset> => {
        return {
          network: ethereum,
          assetId: null,
          assetExternalId: unlistedAssetAddress
        }
      }

      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        findByOnchainIdFallback,
        transferAsset: {
          networkId: ethereum.networkId,
          address: unlistedAssetAddress
        }
      })

      expect(resolvedTransferAsset).toEqual({
        network: ethereum,
        assetId: null,
        assetExternalId: unlistedAssetAddress
      })
    })

    it('resolves native asset when only networkId is set', async () => {
      const resolvedTransferAsset = await transferAssetService.resolve({
        provider: Provider.FIREBLOCKS,
        transferAsset: {
          networkId: ethereum.networkId
        }
      })

      expect(resolvedTransferAsset).toEqual({
        network: expect.objectContaining(ethereum),
        assetId: ether.assetId,
        assetExternalId: etherOnFireblocks?.externalId
      })
    })

    it('throws AssetException when address is set but networkId is not', async () => {
      await expect(
        transferAssetService.resolve({
          provider: Provider.FIREBLOCKS,
          transferAsset: {
            address: usdc.onchainId as string
          }
        })
      ).rejects.toThrow(AssetException)
    })
  })
})
