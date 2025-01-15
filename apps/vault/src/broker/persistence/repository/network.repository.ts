import { LoggerService } from '@narval/nestjs-shared'
import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { Prisma } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ExternalNetwork, Network } from '../../core/type/network.type'
import { Provider } from '../../core/type/provider.type'

type FindAllOptions = {
  filters?: {
    provider?: Provider
  }
}

@Injectable()
export class NetworkRepository implements OnApplicationBootstrap {
  private networkById: Map<string, Network>
  private networkByProviderAndExternalId: Map<string, Network>
  private networksByProvider: Map<string, Network[]>

  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService
  ) {}

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

  async onApplicationBootstrap() {
    await this.index()
  }

  /**
   * Builds index structures for O(1) lookups of networks.
   *
   * Creates three indexes:
   * - networkById: Maps networkId -> Network for direct lookups
   * - networkByProviderAndExternalId: Maps "provider:externalId" -> Network
   *   for external ID lookups
   * - networksByProvider: Maps provider -> Network[] for provider-specific
   *   filtering
   *
   * This is a one-time O(n) operation at initialization to avoid O(n) array
   * traversals on subsequent queries. All lookups become O(1) after indexing
   * at the cost of O(n) additional memory.
   */
  private async index(): Promise<void> {
    const networks = await this.findAll()

    this.networkById = new Map()
    this.networkByProviderAndExternalId = new Map()
    this.networksByProvider = new Map()

    for (const network of networks) {
      this.networkById.set(network.networkId, network)

      for (const externalNetwork of network.externalNetworks) {
        const key = `${externalNetwork.provider}:${externalNetwork.externalId}`
        this.networkByProviderAndExternalId.set(key, network)

        const providerNetworks = this.networksByProvider.get(externalNetwork.provider) || []
        providerNetworks.push(network)
        this.networksByProvider.set(externalNetwork.provider, providerNetworks)
      }
    }
  }

  async buildProviderExternalIdIndex(provider: Provider): Promise<Map<string, Network>> {
    const networks = await this.findAll({ filters: { provider } })
    const index = new Map<string, Network>()

    for (const network of networks) {
      for (const externalNetwork of network.externalNetworks) {
        if (externalNetwork.provider === provider) {
          index.set(externalNetwork.externalId, network)
        }
      }
    }

    return index
  }

  getNetworksByProvider(provider: Provider): Network[] {
    return this.networksByProvider?.get(provider) || []
  }

  async bulkCreate(networks: Network[]): Promise<Network[]> {
    for (const network of networks) {
      const createdAt = network.createdAt || new Date()

      await this.prismaService.network.create({
        data: {
          createdAt,
          id: network.networkId,
          coinType: network.coinType,
          name: network.name,
          externalNetworks: {
            createMany: {
              data: network.externalNetworks.map(({ provider, externalId }) => ({
                provider,
                externalId,
                createdAt
              }))
            }
          }
        },
        include: {
          externalNetworks: true
        }
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

  async bulkAddExternalNetwork(
    params: {
      networkId: string
      externalNetwork: ExternalNetwork
    }[]
  ): Promise<boolean> {
    await this.prismaService.providerNetwork.createMany({
      data: params.map(({ networkId, externalNetwork }) => ({
        ...externalNetwork,
        networkId
      }))
    })

    return true
  }

  async findAll(options?: FindAllOptions): Promise<Network[]> {
    let networks: Network[] = []

    if (this.networkById) {
      if (options?.filters?.provider) {
        networks = this.getNetworksByProvider(options.filters.provider)
      } else {
        networks = Array.from(this.networkById.values())
      }
    }

    if (networks.length) {
      return networks
    }

    this.logger.log('Failed to findAll network in the index. Fallback to the database')

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
    let network: Network | null = null

    if (this.networkById) {
      network = this.networkById.get(networkId) || null
    }

    if (network) {
      return network
    }

    this.logger.log('Failed to findById network in the index. Fallback to the database', { networkId })

    const model = await this.prismaService.network.findUnique({
      where: {
        id: networkId
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
    let network: Network | null = null

    if (this.networkByProviderAndExternalId) {
      const key = `${provider}:${externalId}`
      network = this.networkByProviderAndExternalId.get(key) || null
    }

    if (network) {
      return network
    }

    this.logger.log('Failed to findByExternalId network in the index. Fallback to the database', {
      provider,
      externalId
    })

    const model = await this.prismaService.network.findFirst({
      where: {
        externalNetworks: {
          some: {
            provider,
            externalId
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
