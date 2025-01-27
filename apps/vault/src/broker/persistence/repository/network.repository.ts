import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ExternalNetwork, Network } from '../../core/type/network.type'
import { Provider } from '../../core/type/provider.type'

export type FindAllOptions = {
  filters?: {
    provider?: Provider
  }
}

@Injectable()
export class NetworkRepository {
  constructor(private readonly prismaService: PrismaService) {}

  static parseModel(
    model: Prisma.NetworkGetPayload<{
      include: {
        externalNetworks: true
      }
    }>
  ): Network {
    return Network.parse({
      networkId: model.id,
      coinType: model.coinType,
      name: model.name,
      createdAt: model.createdAt,
      externalNetworks: model.externalNetworks.map(({ externalId, provider }) => ({
        provider,
        externalId
      }))
    })
  }

  async bulkCreate(networks: Network[]): Promise<Network[]> {
    for (const network of networks) {
      const createdAt = network.createdAt || new Date()

      await this.prismaService.network.upsert({
        where: {
          id: network.networkId
        },
        create: {
          createdAt,
          id: network.networkId,
          coinType: network.coinType,
          name: network.name
        },
        update: {
          createdAt,
          id: network.networkId,
          coinType: network.coinType,
          name: network.name
        }
      })

      const externalNetworks = network.externalNetworks.map(({ provider, externalId }) => ({
        provider,
        externalId,
        networkId: network.networkId,
        createdAt
      }))

      // Ensure we have them all inserted
      await this.prismaService.providerNetwork.createMany({
        data: externalNetworks,
        skipDuplicates: true
      })
    }

    return networks
  }

  async addExternalNetwork(networkId: string, externalNetwork: ExternalNetwork): Promise<ExternalNetwork> {
    await this.prismaService.providerNetwork.create({
      data: {
        ...externalNetwork,
        networkId
      }
    })

    return externalNetwork
  }

  async findAll(options?: FindAllOptions): Promise<Network[]> {
    const models = await this.prismaService.network.findMany({
      where: {
        ...(options?.filters?.provider
          ? {
              externalNetworks: {
                some: {
                  provider: options.filters.provider
                }
              }
            }
          : {})
      },
      include: {
        externalNetworks: true
      }
    })

    return models.map(NetworkRepository.parseModel)
  }

  async findById(networkId: string): Promise<Network | null> {
    const model = await this.prismaService.network.findUnique({
      where: {
        id: networkId.toUpperCase()
      },
      include: {
        externalNetworks: true
      }
    })

    if (model) {
      return NetworkRepository.parseModel(model)
    }

    return null
  }

  async findByExternalId(provider: Provider, externalId: string): Promise<Network | null> {
    const model = await this.prismaService.network.findFirst({
      where: {
        externalNetworks: {
          some: {
            provider,
            externalId: externalId.toUpperCase()
          }
        }
      },
      include: {
        externalNetworks: true
      }
    })

    if (model) {
      return NetworkRepository.parseModel(model)
    }

    return null
  }
}
