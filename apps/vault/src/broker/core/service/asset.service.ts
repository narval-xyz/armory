import { LoggerService } from '@narval/nestjs-shared'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { uniq } from 'lodash'
import { AssetRepository } from '../../persistence/repository/asset.repository'
import { AssetException } from '../exception/asset.exception'
import { Asset, ExternalAsset } from '../type/asset.type'
import { Provider } from '../type/provider.type'
import { isNativeAsset } from '../util/asset.util'

type FindAllOptions = {
  filters?: {
    provider?: Provider
  }
}

@Injectable()
export class AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  toBaseUnit(amount: string, decimals: number): string {
    const amountStr = amount.toString()
    const [integerPart, decimalPart = ''] = amountStr.split('.')
    const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals)
    const cleanInteger = integerPart.replace(/^0+/, '') || '0'
    return cleanInteger + paddedDecimal
  }

  async bulkCreate(assets: Asset[]): Promise<Asset[]> {
    const createdAssets: Asset[] = []

    for (const asset of assets) {
      if (isNativeAsset(asset)) {
        // Bypass cache and query repository directly to ensure we check the
        // source of truth.
        const native = await this.assetRepository.findNative(asset.networkId)

        if (native) {
          throw new AssetException({
            message: 'A native asset for the network already exists',
            suggestedHttpStatusCode: HttpStatus.CONFLICT,
            context: { asset }
          })
        }
      }

      createdAssets.push(await this.assetRepository.create(asset))
    }

    const providers = uniq(
      createdAssets.flatMap(({ externalAssets }) => externalAssets).flatMap(({ provider }) => provider)
    )

    for (const provider of providers) {
      const key = this.getListCacheKey(provider)

      this.logger.log('Delete asset list cache after bulk create', { key })

      await this.cacheManager.del(key)
    }

    return createdAssets
  }

  async addExternalAsset(assetId: string, externalAsset: ExternalAsset): Promise<ExternalAsset> {
    return this.assetRepository.addExternalAsset(assetId, externalAsset)
  }

  async bulkAddExternalAsset(
    params: {
      assetId: string
      externalAsset: ExternalAsset
    }[]
  ): Promise<boolean> {
    return this.assetRepository.bulkAddExternalAsset(params)
  }

  async findAll(options?: FindAllOptions): Promise<Asset[]> {
    // IMPORTANT: If you add new filters to the findAll method, you MUST
    // rethink the cache strategy. This will only work as long there's a single
    // filter.
    const key = this.getListCacheKey(options?.filters?.provider)

    this.logger.log('Read asset list from cache', { key })

    const cached = await this.cacheManager.get<Asset[]>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Asset list cache not found. Fallback to database', { key })

    const assets = await this.assetRepository.findAll(options)

    await this.cacheManager.set(key, assets)

    return assets
  }

  private getListCacheKey(provider?: Provider) {
    if (provider) {
      return `asset:list:${provider}`
    }

    return 'asset:list'
  }

  async buildProviderExternalIdIndex(provider: Provider): Promise<Map<string, Asset>> {
    const assets = await this.findAll({ filters: { provider } })
    const index = new Map<string, Asset>()

    for (const asset of assets) {
      for (const externalAsset of asset.externalAssets) {
        if (externalAsset.provider === provider) {
          index.set(externalAsset.externalId, asset)
        }
      }
    }

    return index
  }

  async findById(assetId: string): Promise<Asset | null> {
    const key = `asset:${assetId.toLowerCase()}`

    this.logger.log('Read asset by ID from cache', { key })

    const cached = await this.cacheManager.get<Asset>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Asset cache not found by ID. Fallback to database', { key })

    const asset = await this.assetRepository.findById(assetId)

    await this.cacheManager.set(key, asset)

    return asset
  }

  async findByExternalId(provider: Provider, externalId: string): Promise<Asset | null> {
    const key = `asset:${provider}:${externalId.toLowerCase()}`

    this.logger.log('Read asset by provider and external ID from cache', { key })

    const cached = await this.cacheManager.get<Asset>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Asset cache not found by provider and external ID. Fallback to database', { key })

    const asset = await this.assetRepository.findByExternalId(provider, externalId)

    await this.cacheManager.set(key, asset)

    return asset
  }

  async findByOnchainId(networkId: string, onchainId: string): Promise<Asset | null> {
    const key = `asset:${networkId.toLowerCase()}:${onchainId.toLowerCase()}`

    this.logger.log('Read asset by network and onchain ID from cache', { key })

    const cached = await this.cacheManager.get<Asset>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Asset cache not found by network and onchain ID. Fallback to database', { key })

    const asset = await this.assetRepository.findByOnchainId(networkId, onchainId.toLowerCase())

    await this.cacheManager.set(key, asset)

    return asset
  }

  async findNative(networkId: string): Promise<Asset | null> {
    const key = `asset:native:${networkId.toLowerCase()}`

    this.logger.log('Read native asset from cache', { key })

    const cached = await this.cacheManager.get<Asset>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Native asset cache not found. Fallback to database', { key })

    const asset = await this.assetRepository.findNative(networkId)

    await this.cacheManager.set(key, asset)

    return asset
  }
}
