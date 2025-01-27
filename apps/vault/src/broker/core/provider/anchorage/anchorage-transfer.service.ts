import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { TransferRepository } from '../../../persistence/repository/transfer.repository'
import { AssetException } from '../../exception/asset.exception'
import { BrokerException } from '../../exception/broker.exception'
import { AccountService } from '../../service/account.service'
import { NetworkService } from '../../service/network.service'
import { ResolvedTransferAsset, TransferAssetService } from '../../service/transfer-asset.service'
import { WalletService } from '../../service/wallet.service'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Network } from '../../type/network.type'
import { Provider, ProviderTransferService } from '../../type/provider.type'
import { ConnectionScope } from '../../type/scope.type'
import {
  Destination,
  InternalTransfer,
  NetworkFeeAttribution,
  SendTransfer,
  Source,
  Transfer,
  TransferAsset,
  TransferPartyType,
  TransferStatus,
  isAddressDestination,
  isProviderSpecific
} from '../../type/transfer.type'
import { getExternalNetwork } from '../../util/network.util'
import { ValidConnection, transferPartyTypeToAnchorageResourceType, validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageTransferService implements ProviderTransferService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly networkService: NetworkService,
    private readonly accountService: AccountService,
    private readonly walletService: WalletService,
    private readonly transferRepository: TransferRepository,
    private readonly transferAssetService: TransferAssetService,
    private readonly logger: LoggerService
  ) {}

  async findById(connection: ConnectionWithCredentials, transferId: string): Promise<Transfer> {
    const { clientId, connectionId } = connection

    const context = { clientId, connectionId, transferId }

    this.logger.log('Find Anchorage transfer by ID', context)

    validateConnection(connection)

    const internalTransfer = await this.transferRepository.findById(connection.clientId, transferId)

    this.logger.log('Found internal transfer by ID', { ...context, internalTransfer })

    const anchorageTransfer = await this.anchorageClient.getTransferById({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      transferId: internalTransfer.externalId
    })

    this.logger.log('Found remote transfer by external ID', { ...context, anchorageTransfer })

    const transfer = {
      connectionId,
      assetExternalId: internalTransfer.assetExternalId,
      assetId: internalTransfer.assetId,
      clientId: internalTransfer.clientId,
      createdAt: new Date(anchorageTransfer.createdAt),
      customerRefId: internalTransfer.customerRefId,
      destination: internalTransfer.destination,
      externalId: internalTransfer.externalId,
      externalStatus: anchorageTransfer.status,
      grossAmount: anchorageTransfer.amount.quantity,
      idempotenceId: internalTransfer.idempotenceId,
      memo: anchorageTransfer.transferMemo || internalTransfer.memo || null,
      networkFeeAttribution: internalTransfer.networkFeeAttribution,
      provider: internalTransfer.provider,
      providerSpecific: internalTransfer.providerSpecific,
      source: internalTransfer.source,
      status: this.mapStatus(anchorageTransfer.status),
      transferId: internalTransfer.transferId,
      fees: anchorageTransfer.fee
        ? [
            {
              type: 'network',
              attribution: internalTransfer.networkFeeAttribution,
              amount: anchorageTransfer.fee?.quantity,
              assetId: anchorageTransfer.fee?.assetType
            }
          ]
        : []
    }

    this.logger.log('Combined internal and remote Anchorage transfer', { ...context, transfer })

    return transfer
  }

  private mapStatus(status: string): TransferStatus {
    const upperCasedStatus = status.toUpperCase()
    const statuses: Record<string, TransferStatus> = {
      IN_PROGRESS: TransferStatus.PROCESSING,
      QUEUED: TransferStatus.PROCESSING,
      COMPLETED: TransferStatus.SUCCESS,
      FAILED: TransferStatus.FAILED
    }

    if (upperCasedStatus in statuses) {
      return statuses[upperCasedStatus]
    }

    throw new BrokerException({
      message: 'Cannot map Anchorage transfer status',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { status: upperCasedStatus }
    })
  }

  async send(connection: ConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    const { clientId, connectionId } = connection
    const context = { clientId, connectionId }

    this.logger.log('Send Anchorage transfer', { ...context, sendTransfer })

    validateConnection(connection)

    const transferAsset = await this.findTransferAsset(connection, sendTransfer.asset)
    if (!transferAsset) {
      throw new BrokerException({
        message: 'Transfer asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { asset: sendTransfer.asset }
      })
    }

    const source = await this.getSource(connection, sendTransfer.source)

    const destination = await this.getDestination(connection, sendTransfer.destination)

    this.logger.log('Resolved Anchorage transfer source and destination', { ...context, source, destination })

    // NOTE: Because Anchorage defaults `deductFeeFromAmountIfSameType` to
    // false, we default the fee attribution to ON_TOP to match their API's
    // behaviour.
    const networkFeeAttribution = sendTransfer.networkFeeAttribution || NetworkFeeAttribution.ON_TOP

    const data = {
      source,
      destination,
      assetType: transferAsset.assetExternalId,
      amount: sendTransfer.amount,
      transferMemo: sendTransfer.memo || null,
      idempotentId: sendTransfer.idempotenceId,
      deductFeeFromAmountIfSameType: this.getDeductFeeFromAmountIfSameType(networkFeeAttribution),
      ...(isProviderSpecific(sendTransfer.providerSpecific) ? { ...sendTransfer.providerSpecific } : {})
    }

    this.logger.log('Send create transfer request to Anchorage', { ...context, data })

    const anchorageTransfer = await this.anchorageClient.createTransfer({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      data
    })

    this.logger.log('Anchorage transfer created', context)

    const internalTransfer: InternalTransfer = {
      assetId: transferAsset.assetId,
      assetExternalId: transferAsset.assetExternalId,
      clientId: clientId,
      createdAt: new Date(),
      customerRefId: null,
      destination: sendTransfer.destination,
      externalId: anchorageTransfer.transferId,
      externalStatus: anchorageTransfer.status,
      grossAmount: sendTransfer.amount,
      idempotenceId: sendTransfer.idempotenceId,
      connectionId,
      memo: sendTransfer.memo || null,
      networkFeeAttribution,
      provider: Provider.ANCHORAGE,
      providerSpecific: sendTransfer.providerSpecific || null,
      source: sendTransfer.source,
      status: this.mapStatus(anchorageTransfer.status),
      transferId: uuid()
    }

    this.logger.log('Create internal transfer', { ...context, internalTransfer })

    await this.transferRepository.bulkCreate([internalTransfer])

    return internalTransfer
  }

  /**
   * Anchorage uses `deductFeeFromAmountIfSameType` that if set to true fees
   * will be added to amount requested.
   *
   * Example: a request to transfer 5 BTC with
   * `deductFeeFromAmountIfSameType=false` would result in 5 exactly BTC
   * received to the destination and just over 5 BTC spent by the source.
   *
   * Note: Anchorage API defaults to `false`.
   *
   * @see https://docs.anchorage.com/reference/createtransfer
   */
  private getDeductFeeFromAmountIfSameType(attribution: NetworkFeeAttribution): boolean {
    if (attribution === NetworkFeeAttribution.DEDUCT) {
      return true
    }

    if (attribution === NetworkFeeAttribution.ON_TOP) {
      return false
    }

    return false
  }

  private async getSource(scope: ConnectionScope, source: Source) {
    if (source.type === TransferPartyType.WALLET) {
      const wallet = await this.walletService.findById(scope, source.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(source.type),
        id: wallet.externalId
      }
    }

    if (source.type === TransferPartyType.ACCOUNT) {
      const wallet = await this.accountService.findById(scope, source.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(source.type),
        id: wallet.externalId
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Anchorage transfer source',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { scope, source }
    })
  }

  private async getDestination(scope: ConnectionScope, destination: Destination) {
    if (isAddressDestination(destination)) {
      // IMPORTANT: For both known and unknown addresses, we pass them directly
      // to Anchorage without validating their existence on our side. If the
      // provided address is neither an Anchorage Address nor a Trusted
      // Address, we let Anchorage handle the failure.
      return {
        type: transferPartyTypeToAnchorageResourceType(TransferPartyType.ADDRESS),
        id: destination.address
      }
    }

    if (destination.type === TransferPartyType.WALLET) {
      const wallet = await this.walletService.findById(scope, destination.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(destination.type),
        id: wallet.externalId
      }
    }

    if (destination.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(scope, destination.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(destination.type),
        id: account.externalId
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Anchorage transfer destination',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { scope, destination }
    })
  }

  private async findTransferAsset(
    connection: ValidConnection,
    transferAsset: TransferAsset
  ): Promise<ResolvedTransferAsset> {
    const findByExternalIdFallback = async (externalAssetId: string): Promise<ResolvedTransferAsset> => {
      const anchorageAssetTypes = await this.anchorageClient.getAssetTypes({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      const anchorageAssetType = anchorageAssetTypes.find(
        ({ assetType }) => assetType.toLowerCase() === externalAssetId.toLowerCase()
      )
      if (!anchorageAssetType) {
        throw new AssetException({
          message: 'Anchorage asset type not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset }
        })
      }

      const network = await this.networkService.findByExternalId(Provider.ANCHORAGE, anchorageAssetType.networkId)
      if (!network) {
        throw new AssetException({
          message: 'Anchorage asset type network not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset, anchorageAssetType }
        })
      }

      return {
        network,
        assetExternalId: externalAssetId,
        assetId: null
      }
    }

    const findByOnchainIdFallback = async (network: Network, onchainId: string): Promise<ResolvedTransferAsset> => {
      const externalNetwork = getExternalNetwork(network, Provider.ANCHORAGE)
      if (!externalNetwork) {
        throw new AssetException({
          message: 'Network does not support Anchorage',
          suggestedHttpStatusCode: HttpStatus.NOT_IMPLEMENTED,
          context: { transferAsset, network }
        })
      }

      const anchorageAssetTypes = await this.anchorageClient.getAssetTypes({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      const anchorageAssetType = anchorageAssetTypes.find(
        ({ onchainIdentifier, networkId }) =>
          onchainIdentifier?.toLowerCase() === onchainId.toLowerCase() &&
          networkId.toLowerCase() === externalNetwork.externalId.toLowerCase()
      )
      if (!anchorageAssetType) {
        throw new AssetException({
          message: 'Anchorage asset type not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset }
        })
      }

      return {
        network,
        assetId: null,
        assetExternalId: anchorageAssetType.assetType
      }
    }

    return this.transferAssetService.resolve({
      findByExternalIdFallback,
      findByOnchainIdFallback,
      transferAsset,
      provider: Provider.ANCHORAGE
    })
  }
}
