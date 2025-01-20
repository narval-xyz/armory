import { HttpStatus, Injectable } from '@nestjs/common'
import { AssetRepository } from '../../persistence/repository/asset.repository'
import { AssetException } from '../exception/asset.exception'
import { Asset, ExternalAsset } from '../type/asset.type'
import { Provider } from '../type/provider.type'
import { TransferAsset } from '../type/transfer.type'
import { isNativeAsset } from '../util/asset.util'

type FindAllOptions = {
  filters?: {
    provider?: Provider
  }
}

@Injectable()
export class AssetService {
  constructor(private readonly assetRepository: AssetRepository) {}

  async bulkCreate(assets: Asset[]): Promise<Asset[]> {
    const createdAssets: Asset[] = []

    for (const asset of assets) {
      if (isNativeAsset(asset)) {
        const native = await this.findNative(asset.networkId)

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
    return this.assetRepository.findAll(options)
  }

  async findById(assetId: string): Promise<Asset | null> {
    return this.assetRepository.findById(assetId)
  }

  async findByExternalId(provider: Provider, externalId: string): Promise<Asset | null> {
    return this.assetRepository.findByExternalId(provider, externalId)
  }

  async findByOnchainId(networkId: string, onchainId: string): Promise<Asset | null> {
    return this.assetRepository.findByOnchainId(networkId, onchainId.toLowerCase())
  }

  async findNative(networkId: string): Promise<Asset | null> {
    return this.assetRepository.findNative(networkId)
  }

  async findTransferAsset(provider: Provider, transferAsset: TransferAsset): Promise<Asset | null> {
    if (transferAsset.externalAssetId) {
      return this.findByExternalId(provider, transferAsset.externalAssetId)
    }

    if (transferAsset.assetId) {
      return this.findById(transferAsset.assetId)
    }

    if (!transferAsset.networkId) {
      throw new AssetException({
        message: 'Cannot find transfer asset without network ID',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { asset: transferAsset }
      })
    }

    if (transferAsset.address) {
      return this.findByOnchainId(transferAsset.networkId, transferAsset.address)
    }

    return this.findNative(transferAsset.networkId)
  }
}
