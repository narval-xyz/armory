import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { AssetException } from '../../core/exception/asset.exception'
import { Asset, ExternalAsset } from '../../core/type/asset.type'
import { Provider } from '../../core/type/provider.type'

type FindAllOptions = {
  filters?: {
    provider?: Provider
  }
}

@Injectable()
export class AssetRepository {
  constructor(private readonly prismaService: PrismaService) {}

  static parseModel(
    model: Prisma.AssetGetPayload<{
      include: {
        externalAssets: true
      }
    }>
  ): Asset {
    return Asset.parse({
      assetId: model.id,
      name: model.name,
      symbol: model.symbol,
      decimals: model.decimals,
      networkId: model.networkId,
      onchainId: model.onchainId,
      createdAt: model.createdAt,
      externalAssets: model.externalAssets.map(({ externalId, provider }) => ({
        provider,
        externalId
      }))
    })
  }

  async create(asset: Asset): Promise<Asset> {
    const parse = Asset.parse(asset)
    const createdAt = parse.createdAt || new Date()

    await this.prismaService.asset.create({
      data: {
        createdAt,
        id: parse.assetId,
        name: parse.name,
        symbol: parse.symbol,
        decimals: parse.decimals,
        networkId: parse.networkId,
        onchainId: parse.onchainId,
        externalAssets: {
          createMany: {
            data: parse.externalAssets.map(({ provider, externalId }) => ({
              provider,
              externalId,
              createdAt
            }))
          }
        }
      },
      include: {
        externalAssets: true
      }
    })

    return parse
  }

  async addExternalAsset(assetId: string, externalAsset: ExternalAsset): Promise<ExternalAsset> {
    await this.prismaService.providerAsset.create({
      data: {
        ...externalAsset,
        assetId
      }
    })

    return externalAsset
  }

  async bulkAddExternalAsset(
    params: {
      assetId: string
      externalAsset: ExternalAsset
    }[]
  ): Promise<boolean> {
    await this.prismaService.providerAsset.createMany({
      data: params.map(({ assetId, externalAsset }) => ({
        ...externalAsset,
        assetId
      }))
    })

    return true
  }

  async findAll(options?: FindAllOptions): Promise<Asset[]> {
    const models = await this.prismaService.asset.findMany({
      where: {
        ...(options?.filters?.provider
          ? {
              externalAssets: {
                some: {
                  provider: options.filters.provider
                }
              }
            }
          : {})
      },
      include: {
        externalAssets: true
      }
    })

    return models.map(AssetRepository.parseModel)
  }

  async findById(assetId: string): Promise<Asset | null> {
    const model = await this.prismaService.asset.findUnique({
      where: {
        id: assetId
      },
      include: {
        externalAssets: true
      }
    })

    if (model) {
      return AssetRepository.parseModel(model)
    }

    return null
  }

  async findByExternalId(provider: Provider, externalId: string): Promise<Asset | null> {
    const model = await this.prismaService.asset.findFirst({
      where: {
        externalAssets: {
          some: {
            provider,
            externalId
          }
        }
      },
      include: {
        externalAssets: true
      }
    })

    if (model) {
      return AssetRepository.parseModel(model)
    }

    return null
  }

  async findByOnchainId(networkId: string, onchainId: string): Promise<Asset | null> {
    const models = await this.prismaService.asset.findMany({
      where: {
        networkId,
        onchainId
      },
      include: {
        externalAssets: true
      }
    })

    return models.length ? AssetRepository.parseModel(models[0]) : null
  }

  async findNative(networkId: string): Promise<Asset | null> {
    const models = await this.prismaService.asset.findMany({
      where: {
        networkId,
        onchainId: null
      },
      include: {
        externalAssets: true
      }
    })

    // NOTE: This invariant is protected at the service level on create.
    if (models.length > 1) {
      throw new AssetException({
        message: 'Found more than one native asset for network',
        context: {
          networkId,
          modelIds: models.map(({ id }) => id)
        }
      })
    }

    return models.length ? AssetRepository.parseModel(models[0]) : null
  }
}
