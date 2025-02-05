import { LoggerService, PaginatedResult } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { FireblocksClient, WhitelistedWallet } from '../../../http/client/fireblocks.client'
import { BrokerException } from '../../exception/broker.exception'
import { AssetService } from '../../service/asset.service'
import { Asset } from '../../type/asset.type'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { KnownDestination } from '../../type/known-destination.type'
import {
  Provider,
  ProviderKnownDestinationPaginationOptions,
  ProviderKnownDestinationService
} from '../../type/provider.type'
import { WhitelistClassification } from './fireblocks.type'
import { validateConnection } from './fireblocks.util'

@Injectable()
export class FireblocksKnownDestinationService implements ProviderKnownDestinationService {
  constructor(
    private readonly fireblocksClient: FireblocksClient,
    private readonly assetService: AssetService,
    private readonly logger: LoggerService
  ) {}

  async findAll(
    connection: ConnectionWithCredentials,
    // NOTE: Fireblocks doesn't provide pagination on whitelisted resource
    // endpoints.
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: ProviderKnownDestinationPaginationOptions | undefined
  ): Promise<PaginatedResult<KnownDestination>> {
    validateConnection(connection)

    const fireblocksWhitelistedInternalsWallets = await this.fireblocksClient.getWhitelistedInternalWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const fireblocksWhitelistedExternalWallets = await this.fireblocksClient.getWhitelistedExternalWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const fireblocksWhitelistedContracts = await this.fireblocksClient.getWhitelistedContracts({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const assetsIndexedByExternalId = await this.assetService.buildProviderExternalIdIndex(Provider.FIREBLOCKS)

    const knownDestinations: KnownDestination[] = [
      ...this.buildKnownDestinations({
        connection,
        assetsIndexedByExternalId,
        classification: WhitelistClassification.INTERNAL,
        resources: fireblocksWhitelistedInternalsWallets
      }),
      ...this.buildKnownDestinations({
        connection,
        assetsIndexedByExternalId,
        classification: WhitelistClassification.EXTERNAL,
        resources: fireblocksWhitelistedExternalWallets
      }),
      ...this.buildKnownDestinations({
        connection,
        assetsIndexedByExternalId,
        classification: WhitelistClassification.CONTRACT,
        resources: fireblocksWhitelistedContracts
      })
    ]

    return { data: knownDestinations }
  }

  private buildKnownDestinations(params: {
    connection: ConnectionWithCredentials
    resources: WhitelistedWallet[]
    classification: WhitelistClassification
    assetsIndexedByExternalId: Map<string, Asset>
  }): KnownDestination[] {
    const { connection, resources, classification, assetsIndexedByExternalId } = params
    const knownDestinations: KnownDestination[] = []

    for (const resource of resources) {
      for (const fireblocksAsset of resource.assets) {
        // NOTE: We only include assets ready to be used with 'APPROVED' status
        // since we don't have any UX to display asset status to users.
        if (fireblocksAsset.status === 'APPROVED') {
          const asset = assetsIndexedByExternalId.get(fireblocksAsset.id)
          const externalId = this.getExternalId(classification, resource.id, fireblocksAsset.id)

          if (asset) {
            knownDestinations.push({
              externalId,
              address: fireblocksAsset.address.toLowerCase(),
              externalClassification: classification,
              clientId: connection.clientId,
              connectionId: connection.connectionId,
              provider: Provider.FIREBLOCKS,
              assetId: asset.assetId,
              networkId: asset.networkId
            })
          } else {
            this.logger.warn('Skip Fireblocks known destination due to asset not found', {
              externalId,
              classification,
              clientId: connection.clientId,
              connectionId: connection.connectionId,
              externalAssetId: fireblocksAsset.id
            })
          }
        }
      }
    }

    return knownDestinations
  }

  private getExternalId(classification: WhitelistClassification, resourceId: string, assetId: string): string {
    switch (classification) {
      case WhitelistClassification.INTERNAL:
        return `fireblocks/whitelisted-internal-wallet/${resourceId}/asset/${assetId}`
      case WhitelistClassification.EXTERNAL:
        return `fireblocks/whitelisted-external-wallet/${resourceId}/asset/${assetId}`
      case WhitelistClassification.CONTRACT:
        return `fireblocks/whitelisted-contract/${resourceId}/asset/${assetId}`
      default:
        throw new BrokerException({
          message: `Unknown Fireblocks classification ${classification}`,
          suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          context: { resourceId, assetId }
        })
    }
  }
}
