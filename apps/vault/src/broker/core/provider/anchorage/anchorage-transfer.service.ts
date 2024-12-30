import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { TransferRepository } from '../../../persistence/repository/transfer.repository'
import { BrokerException } from '../../exception/broker.exception'
import { TransferPartyService } from '../../service/transfer-party.service'
import { ActiveConnectionWithCredentials, Provider } from '../../type/connection.type'
import { ProviderTransferService } from '../../type/provider.type'
import {
  Destination,
  InternalTransfer,
  NetworkFeeAttribution,
  SendTransfer,
  Source,
  Transfer,
  TransferPartyType,
  TransferStatus,
  isAddressDestination,
  isProviderSpecific
} from '../../type/transfer.type'

@Injectable()
export class AnchorageTransferService implements ProviderTransferService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly transferPartyService: TransferPartyService,
    private readonly transferRepository: TransferRepository,
    private readonly logger: LoggerService
  ) {}

  async findById(connection: ActiveConnectionWithCredentials, transferId: string): Promise<Transfer> {
    this.logger.log('Find Anchorage transfer by ID', {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      transferId
    })

    const internalTransfer = await this.transferRepository.findById(connection.clientId, transferId)

    this.logger.log('Found internal transfer by ID', internalTransfer)

    const anchorageTransfer = await this.anchorageClient.getTransferById({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      transferId: internalTransfer.externalId
    })

    this.logger.log('Found remote transfer by external ID', anchorageTransfer)

    const transfer = {
      assetId: internalTransfer.assetId,
      clientId: internalTransfer.clientId,
      createdAt: new Date(anchorageTransfer.createdAt),
      customerRefId: internalTransfer.customerRefId,
      destination: internalTransfer.destination,
      externalId: internalTransfer.externalId,
      grossAmount: anchorageTransfer.amount.quantity,
      idempotenceId: internalTransfer.idempotenceId,
      memo: anchorageTransfer.transferMemo || internalTransfer.memo || null,
      networkFeeAttribution: internalTransfer.networkFeeAttribution,
      provider: internalTransfer.provider,
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

    this.logger.log('Combined internal and remote transfer', transfer)

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

  async send(connection: ActiveConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    this.logger.log('Send Anchorage transfer', {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      sendTransfer
    })

    const source = await this.transferPartyService.resolve(connection.clientId, sendTransfer.source)
    const destination = await this.transferPartyService.resolve(connection.clientId, sendTransfer.destination)

    this.logger.log('Resolved source and destination', { source, destination })

    // NOTE: Because Anchorage defaults `deductFeeFromAmountIfSameType` to false, we
    // default the fee attribution to ON_TOP to match their API's behaviour.
    const networkFeeAttribution = sendTransfer.networkFeeAttribution || NetworkFeeAttribution.ON_TOP
    const data = {
      source: {
        type: this.getResourceType(sendTransfer.source),
        id: source.externalId
      },
      destination: {
        type: this.getResourceType(sendTransfer.destination),
        id: destination.externalId
      },
      assetType: sendTransfer.assetId,
      amount: sendTransfer.amount,
      customerRefId: sendTransfer.customerRefId || null,
      transferMemo: sendTransfer.memo || null,
      idempotentId: sendTransfer.idempotenceId || null,
      deductFeeFromAmountIfSameType: this.getDeductFeeFromAmountIfSameType(networkFeeAttribution),
      ...(isProviderSpecific(sendTransfer.providerSpecific) ? { ...sendTransfer.providerSpecific } : {})
    }

    const anchorageTransfer = await this.anchorageClient.createTransfer({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      data
    })

    const internalTransfer: InternalTransfer = {
      assetId: sendTransfer.assetId,
      clientId: connection.clientId,
      createdAt: new Date(),
      customerRefId: sendTransfer.customerRefId || null,
      destination: sendTransfer.destination,
      externalId: anchorageTransfer.transferId,
      grossAmount: sendTransfer.amount,
      idempotenceId: sendTransfer.idempotenceId || null,
      memo: sendTransfer.memo || null,
      networkFeeAttribution,
      provider: Provider.ANCHORAGE,
      providerSpecific: sendTransfer.providerSpecific || null,
      source: sendTransfer.source,
      status: this.mapStatus(anchorageTransfer.status),
      transferId: uuid()
    }

    this.logger.log('Create internal transfer', internalTransfer)

    await this.transferRepository.bulkCreate([internalTransfer])

    return internalTransfer
  }

  /**
   * Anchorage uses `deductFeeFromAmountIfSameType` that if set to true fees
   * will be added to amount requested.
   *
   * Example: a request to transfer 5 BTC with
   * `deductFeeFromAmountIfSameType=false` would result in 5 exactly BTC
   * received to the destination vault and just over 5 BTC spent by the source
   * vault.
   *
   * NOTE: Anchorage API defaults to `false`.
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

  private getResourceType(transferParty: Source | Destination) {
    if (isAddressDestination(transferParty)) {
      return 'ADDRESS'
    }

    if (transferParty.type === TransferPartyType.WALLET) {
      return 'VAULT'
    }

    if (transferParty.type === TransferPartyType.ACCOUNT) {
      return 'WALLET'
    }

    if (transferParty.type === TransferPartyType.ADDRESS) {
      return 'ADDRESS'
    }

    throw new BrokerException({
      message: 'Cannot get Anchorage resource type from transfer party type',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { party: transferParty }
    })
  }
}
