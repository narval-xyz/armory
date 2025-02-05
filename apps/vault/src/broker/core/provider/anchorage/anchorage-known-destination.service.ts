import { LoggerService, PaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { AssetService } from '../../service/asset.service'
import { NetworkService } from '../../service/network.service'
import { Asset } from '../../type/asset.type'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { KnownDestination } from '../../type/known-destination.type'
import {
  Provider,
  ProviderKnownDestinationPaginationOptions,
  ProviderKnownDestinationService
} from '../../type/provider.type'
import { validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageKnownDestinationService implements ProviderKnownDestinationService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly networkService: NetworkService,
    private readonly assetService: AssetService,
    private readonly logger: LoggerService
  ) {}

  async findAll(
    connection: ConnectionWithCredentials,
    options?: ProviderKnownDestinationPaginationOptions | undefined
  ): Promise<PaginatedResult<KnownDestination>> {
    validateConnection(connection)

    const anchorageTrustedDestinations = await this.anchorageClient.getTrustedDestinations({
      url: connection.url,
      limit: options?.limit,
      afterId: options?.cursor,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const assetsIndexedByExternalId = await this.assetService.buildProviderExternalIdIndex(Provider.ANCHORAGE)

    const networksIndexedByExternalId = await this.networkService.buildProviderExternalIdIndex(Provider.ANCHORAGE)

    const knownDestinations: KnownDestination[] = []

    for (const anchorageTrustedDestination of anchorageTrustedDestinations.data) {
      const externalId = anchorageTrustedDestination.id
      const network = networksIndexedByExternalId.get(anchorageTrustedDestination.crypto.networkId)

      let asset: Asset | undefined

      if (anchorageTrustedDestination.crypto.assetType) {
        this.logger.log('Lookup Anchorage trusted destination asset type', {
          clientId: connection.clientId,
          connectionId: connection.connectionId,
          trustedDestination: anchorageTrustedDestination
        })

        asset = assetsIndexedByExternalId.get(anchorageTrustedDestination.crypto.assetType)
      }

      if (network) {
        const knownDestination = KnownDestination.parse({
          externalId,
          address: anchorageTrustedDestination.crypto.address.toLowerCase(),
          assetId: asset?.assetId,
          externalClassification: null,
          clientId: connection.clientId,
          connectionId: connection.connectionId,
          // NOTE: Anchorage doesn't return a label for trusted destinations.
          label: null,
          networkId: network.networkId,
          provider: Provider.ANCHORAGE
        })

        knownDestinations.push(knownDestination)
      } else {
        this.logger.warn('Skip Anchorage known destination due to network not found', {
          externalId,
          externalNetworkId: anchorageTrustedDestination.crypto.networkId,
          address: anchorageTrustedDestination.crypto.address,
          clientId: connection.clientId,
          connectionId: connection.connectionId
        })
      }
    }

    const last = knownDestinations[knownDestinations.length - 1]

    if (anchorageTrustedDestinations.page.next && last) {
      return {
        data: knownDestinations,
        page: {
          next: last.externalId
        }
      }
    }

    return {
      data: knownDestinations
    }
  }
}
