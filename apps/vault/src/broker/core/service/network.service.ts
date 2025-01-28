import { LoggerService } from '@narval/nestjs-shared'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { uniq } from 'lodash'
import { FindAllOptions, NetworkRepository } from '../../persistence/repository/network.repository'
import { ExternalNetwork, Network } from '../type/network.type'
import { Provider } from '../type/provider.type'

@Injectable()
export class NetworkService {
  constructor(
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async bulkCreate(networks: Network[]): Promise<Network[]> {
    await this.networkRepository.bulkCreate(networks)

    const providers = uniq(
      networks.flatMap(({ externalNetworks }) => externalNetworks).flatMap(({ provider }) => provider)
    )

    for (const provider of providers) {
      await this.cacheManager.del(this.getListCacheKey(provider))
    }

    return networks
  }

  async addExternalNetwork(networkId: string, externalNetwork: ExternalNetwork): Promise<ExternalNetwork> {
    await this.networkRepository.addExternalNetwork(networkId, externalNetwork)

    await this.cacheManager.del(this.getListCacheKey(externalNetwork.provider))

    return externalNetwork
  }

  async findAll(options?: FindAllOptions): Promise<Network[]> {
    // IMPORTANT: If you add new filters to the findAll method, you MUST
    // rethink the cache strategy. This will only work as long there's a single
    // filter.
    const key = this.getListCacheKey(options?.filters?.provider)

    this.logger.log('Read network list from cache', { key })

    const cached = await this.cacheManager.get<Network[]>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Network list cache not found. Fallback to database', { key })

    const assets = await this.networkRepository.findAll(options)

    await this.cacheManager.set(key, assets)

    return assets
  }

  private getListCacheKey(provider?: Provider) {
    if (provider) {
      return `network:list:${provider}`
    }

    return 'network:list'
  }

  async findById(networkId: string): Promise<Network | null> {
    const key = `network:${networkId.toLowerCase()}`

    this.logger.log('Read network by ID from cache', { key })

    const cached = await this.cacheManager.get<Network>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Network cache not found by ID. Fallback to database', { key })

    const asset = await this.networkRepository.findById(networkId)

    await this.cacheManager.set(key, asset)

    return asset
  }

  async findByExternalId(provider: Provider, externalId: string): Promise<Network | null> {
    const key = `network:${provider}:${externalId.toLowerCase()}`

    this.logger.log('Read network by provider and external ID from cache', { key })

    const cached = await this.cacheManager.get<Network>(key)

    if (cached) {
      return cached
    }

    this.logger.log('Network cache not found by provider and external ID. Fallback to database', { key })

    const asset = await this.networkRepository.findByExternalId(provider, externalId)

    await this.cacheManager.set(key, asset)

    return asset
  }

  /**
   * Builds index structures for O(1) lookups of networks.
   *
   * This is a one-time O(n) operation at initialization to avoid O(n) array
   * traversals on subsequent queries. All lookups become O(1) after indexing
   * at the cost of O(n) additional memory.
   */
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
}
