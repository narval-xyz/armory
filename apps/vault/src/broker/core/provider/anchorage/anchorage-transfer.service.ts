import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { TransferRepository } from '../../../persistence/repository/transfer.repository'
import { BrokerException } from '../../exception/broker.exception'
import { AccountService } from '../../service/account.service'
import { WalletService } from '../../service/wallet.service'
import { Asset } from '../../type/asset.type'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider, ProviderTransferService } from '../../type/provider.type'
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
import { AnchorageAssetService } from './anchorage-asset.service'
import { transferPartyTypeToAnchorageResourceType, validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageTransferService implements ProviderTransferService {
  constructor(
    private readonly anchorageAssetService: AnchorageAssetService,
    private readonly anchorageClient: AnchorageClient,
    private readonly networkRepository: NetworkRepository,
    private readonly accountService: AccountService,
    private readonly walletService: WalletService,
    private readonly transferRepository: TransferRepository,
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

  private async resolveAsset(asset: TransferAsset): Promise<Asset | null> {
    if (asset.externalAssetId) {
      return this.anchorageAssetService.findByExternalId(asset.externalAssetId)
    }

    if (asset.assetId) {
      // TODO: Look up by the narval assetId; for now we just treat it as the
      // same as the anchorage one.
      return this.anchorageAssetService.findByExternalId(asset.assetId)
    }

    if (!asset.networkId) {
      throw new BrokerException({
        message: 'Cannot resolve asset without networkId',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        context: { asset }
      })
    }

    if (asset.address) {
      return this.anchorageAssetService.findByOnchainId(asset.networkId, asset.address)
    }

    return this.anchorageAssetService.findNativeAsset(asset.networkId)
  }

  async send(connection: ConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    const { clientId, connectionId } = connection
    const context = { clientId, connectionId }

    this.logger.log('Send Anchorage transfer', { ...context, sendTransfer })

    validateConnection(connection)

    const asset = await this.resolveAsset(sendTransfer.asset)
    if (!asset) {
      throw new BrokerException({
        message: 'Cannot resolve asset',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        context: { asset: sendTransfer.asset }
      })
    }

    const network = await this.networkRepository.findById(asset.networkId)
    if (!network) {
      throw new BrokerException({
        message: 'Cannot resolve Narval networkId from Anchorage networkId',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        context: { asset }
      })
    }

    const source = await this.getSource(clientId, sendTransfer.source)
    const destination = await this.getDestination(clientId, sendTransfer.destination)

    this.logger.log('Resolved Anchorage source and destination', { ...context, source, destination })

    // NOTE: Because Anchorage defaults `deductFeeFromAmountIfSameType` to
    // false, we default the fee attribution to ON_TOP to match their API's
    // behaviour.
    const networkFeeAttribution = sendTransfer.networkFeeAttribution || NetworkFeeAttribution.ON_TOP
    const data = {
      source,
      destination,
      assetType: asset.externalId,
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
      // TODO: switch this to the Narval assetId once that is a real thing.
      assetId: asset.externalId,
      clientId: clientId,
      createdAt: new Date(),
      customerRefId: null,
      destination: sendTransfer.destination,
      externalId: anchorageTransfer.transferId,
      externalStatus: anchorageTransfer.status,
      grossAmount: sendTransfer.amount,
      idempotenceId: sendTransfer.idempotenceId,
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

  private async getSource(clientId: string, source: Source) {
    if (source.type === TransferPartyType.WALLET) {
      const wallet = await this.walletService.findById(clientId, source.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(source.type),
        id: wallet.externalId
      }
    }

    if (source.type === TransferPartyType.ACCOUNT) {
      const wallet = await this.accountService.findById(clientId, source.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(source.type),
        id: wallet.externalId
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Anchorage transfer source',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId, source }
    })
  }

  private async getDestination(clientId: string, destination: Destination) {
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
      const wallet = await this.walletService.findById(clientId, destination.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(destination.type),
        id: wallet.externalId
      }
    }

    if (destination.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(clientId, destination.id)

      return {
        type: transferPartyTypeToAnchorageResourceType(destination.type),
        id: account.externalId
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Anchorage transfer destination',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId, destination }
    })
  }
}
