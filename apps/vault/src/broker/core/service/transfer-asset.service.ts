import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { AssetException } from '../exception/asset.exception'
import { Network } from '../type/network.type'
import { Provider } from '../type/provider.type'
import { TransferAsset } from '../type/transfer.type'
import { getExternalAsset } from '../util/asset.util'
import { getExternalNetwork } from '../util/network.util'
import { AssetService } from './asset.service'
import { NetworkService } from './network.service'

export type ResolvedTransferAsset = {
  network: Network
  assetId: string | null
  assetExternalId: string
}

export type FindByExternalIdFallback = (externalAssetId: string) => Promise<ResolvedTransferAsset>

export type FindByOnchainIdFallback = (network: Network, onchainId: string) => Promise<ResolvedTransferAsset>

export type ResolveTransferAssetParams = {
  transferAsset: TransferAsset
  provider: Provider
  findByExternalIdFallback?: FindByExternalIdFallback
  findByOnchainIdFallback?: FindByOnchainIdFallback
}

@Injectable()
export class TransferAssetService {
  constructor(
    private readonly assetService: AssetService,
    private readonly networkService: NetworkService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Resolves a transfer asset using the following strategy:
   * 1. By external asset ID if provided
   * 2. By internal asset ID if provided
   * 3. By network ID + onchain address if both provided
   * 4. Falls back to native asset of the network if only network ID is provided
   *
   * For external ID and onchain address resolution, supports fallback
   * functions that can handle assets not yet listed. Fallbacks are called only
   * after an initial lookup fails to find the asset in our database.
   *
   * @throws {AssetException} When asset cannot be resolved or required network
   * info is missing
   */
  async resolve(params: ResolveTransferAssetParams): Promise<ResolvedTransferAsset> {
    const { transferAsset, provider, findByExternalIdFallback, findByOnchainIdFallback } = params

    this.logger.log(`Resolve ${provider} transfer asset`, { transferAsset, provider })

    if (transferAsset.externalAssetId) {
      return this.findByExternalId(provider, transferAsset.externalAssetId, findByExternalIdFallback)
    }

    if (transferAsset.assetId) {
      return this.findByAssetId(provider, transferAsset.assetId)
    }

    if (!transferAsset.networkId) {
      throw new AssetException({
        message: 'Cannot find transfer asset without network ID',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { transferAsset }
      })
    }

    if (transferAsset.address) {
      return this.findByOnchainId(provider, transferAsset.networkId, transferAsset.address, findByOnchainIdFallback)
    }

    return this.findNative(provider, transferAsset.networkId)
  }

  private async findByExternalId(
    provider: Provider,
    externalAssetId: string,
    findByExternalIdFallback?: FindByExternalIdFallback
  ): Promise<ResolvedTransferAsset> {
    this.logger.log('Find asset by external ID', { provider, externalAssetId })

    const asset = await this.assetService.findByExternalId(provider, externalAssetId)

    if (asset) {
      const network = await this.networkService.findById(asset.networkId)
      if (!network) {
        throw new AssetException({
          message: 'Asset network not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { asset }
        })
      }

      const externalAsset = getExternalAsset(asset, provider)
      if (!externalAsset) {
        throw new AssetException({
          message: 'External asset not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { asset, provider }
        })
      }

      return {
        network,
        assetId: asset.assetId,
        assetExternalId: externalAsset.externalId
      }
    }

    if (findByExternalIdFallback) {
      this.logger.log('Asset not listed. Calling given findByExternalIdFallback function', {
        provider,
        externalAssetId
      })

      return findByExternalIdFallback(externalAssetId)
    }

    throw new AssetException({
      message: 'Transfer asset not found by external ID',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { externalAssetId, provider }
    })
  }

  private async findByAssetId(provider: Provider, assetId: string): Promise<ResolvedTransferAsset> {
    this.logger.log('Find asset by ID', { provider, assetId })

    const asset = await this.assetService.findById(assetId)
    if (!asset) {
      throw new AssetException({
        message: 'Asset not found by ID',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { assetId }
      })
    }

    const externalAsset = getExternalAsset(asset, provider)
    if (!externalAsset) {
      throw new AssetException({
        message: 'External asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { assetId, asset, provider }
      })
    }

    const network = await this.networkService.findById(asset.networkId)
    if (!network) {
      throw new AssetException({
        message: 'Asset network not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { assetId, asset }
      })
    }

    return {
      network,
      assetId: asset.assetId,
      assetExternalId: externalAsset.externalId
    }
  }

  private async findByOnchainId(
    provider: Provider,
    networkId: string,
    onchainId: string,
    findByOnchainIdFallback?: FindByOnchainIdFallback
  ): Promise<ResolvedTransferAsset> {
    this.logger.log('Find asset by network and onchain ID', { provider, networkId, onchainId })

    const network = await this.networkService.findById(networkId)
    if (!network) {
      throw new AssetException({
        message: 'Asset network not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { networkId }
      })
    }

    const externalNetwork = getExternalNetwork(network, provider)
    if (!externalNetwork) {
      throw new AssetException({
        message: `Provider ${provider} unlisted network`,
        suggestedHttpStatusCode: HttpStatus.NOT_IMPLEMENTED,
        context: { provider, network }
      })
    }

    const asset = await this.assetService.findByOnchainId(network.networkId, onchainId)
    if (asset) {
      const externalAsset = getExternalAsset(asset, provider)
      if (!externalAsset) {
        throw new AssetException({
          message: 'External asset not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { onchainId, asset, provider }
        })
      }

      return {
        network,
        assetId: asset.assetId,
        assetExternalId: externalAsset.externalId
      }
    }

    if (findByOnchainIdFallback) {
      this.logger.log('Asset not listed. Calling given findByOnchainIdFallback function', {
        network,
        provider,
        onchainId
      })

      return findByOnchainIdFallback(network, onchainId)
    }

    throw new AssetException({
      message: 'Transfer asset not found by network and onchain ID',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { network, onchainId }
    })
  }

  private async findNative(provider: Provider, networkId: string): Promise<ResolvedTransferAsset> {
    this.logger.log('Find native asset', { provider, networkId })

    const asset = await this.assetService.findNative(networkId)
    if (!asset) {
      throw new AssetException({
        message: 'Native asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { networkId }
      })
    }

    const externalAsset = getExternalAsset(asset, provider)
    if (!externalAsset) {
      throw new AssetException({
        message: 'External asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { provider, asset }
      })
    }

    const network = await this.networkService.findById(networkId)
    if (!network) {
      throw new AssetException({
        message: 'Network of native asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { networkId, asset }
      })
    }

    return {
      network,
      assetId: asset.assetId,
      assetExternalId: externalAsset.externalId
    }
  }
}
