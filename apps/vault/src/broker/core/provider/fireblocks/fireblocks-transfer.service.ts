import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CreateTransaction, FireblocksClient } from '../../../http/client/fireblocks.client'
import { TransferRepository } from '../../../persistence/repository/transfer.repository'
import { AssetException } from '../../exception/asset.exception'
import { BrokerException } from '../../exception/broker.exception'
import { AccountService } from '../../service/account.service'
import { AddressService } from '../../service/address.service'
import { AssetService } from '../../service/asset.service'
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
  Transfer,
  TransferAsset,
  TransferPartyType,
  TransferStatus,
  isAddressDestination,
  isProviderSpecific
} from '../../type/transfer.type'
import { getExternalNetwork } from '../../util/network.util'
import { validateConnection } from './fireblocks.util'

@Injectable()
export class FireblocksTransferService implements ProviderTransferService {
  constructor(
    private readonly assetService: AssetService,
    private readonly fireblocksClient: FireblocksClient,
    private readonly networkService: NetworkService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly transferRepository: TransferRepository,
    private readonly transferAssetService: TransferAssetService,
    private readonly logger: LoggerService
  ) {}

  async findById(connection: ConnectionWithCredentials, transferId: string): Promise<Transfer> {
    const { clientId, connectionId } = connection
    const context = { clientId, connectionId, transferId }

    this.logger.log('Find Fireblocks transfer by ID', context)

    validateConnection(connection)

    const internalTransfer = await this.transferRepository.findById(connection.clientId, transferId)

    this.logger.log('Found internal transfer by ID', {
      clientId,
      internalTransfer
    })

    const fireblocksTransaction = await this.fireblocksClient.getTransactionById({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      txId: internalTransfer.externalId
    })

    this.logger.log('Found Fireblocks transaction by ID', context)

    const transfer: Transfer = {
      connectionId,
      assetExternalId: internalTransfer.assetExternalId,
      assetId: internalTransfer.assetId,
      clientId: internalTransfer.clientId,
      createdAt: new Date(fireblocksTransaction.createdAt),
      customerRefId: internalTransfer.customerRefId,
      destination: internalTransfer.destination,
      externalId: internalTransfer.externalId,
      externalStatus: fireblocksTransaction.subStatus || fireblocksTransaction.status || null,
      grossAmount: fireblocksTransaction.amountInfo.amount,
      idempotenceId: internalTransfer.idempotenceId,
      memo: fireblocksTransaction.note || internalTransfer.memo || null,
      networkFeeAttribution: internalTransfer.networkFeeAttribution,
      provider: internalTransfer.provider,
      providerSpecific: internalTransfer.providerSpecific,
      source: internalTransfer.source,
      status: this.mapStatus(fireblocksTransaction.status),
      transferId: internalTransfer.transferId,
      fees: [
        ...(fireblocksTransaction.feeInfo.networkFee
          ? [
              {
                type: 'network',
                attribution: internalTransfer.networkFeeAttribution,
                amount: fireblocksTransaction.feeInfo.networkFee,
                // TODO: (@wcalderipe, 13/01/25): Replace by Narval asset ID
                // once it's a thing.
                assetId: fireblocksTransaction.feeCurrency
              }
            ]
          : []),
        ...(fireblocksTransaction.feeInfo.gasPrice
          ? [
              {
                type: 'gas-price',
                amount: fireblocksTransaction.feeInfo.gasPrice,
                // TODO: (@wcalderipe, 13/01/25): Replace by Narval asset ID
                // once it's a thing.
                assetId: fireblocksTransaction.feeCurrency
              }
            ]
          : [])
      ]
    }

    this.logger.log('Combined internal and remote Fireblocks transfer', { ...context, transfer })

    return transfer
  }

  async send(connection: ConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    const { clientId, connectionId } = connection
    const context = { clientId, connectionId }

    this.logger.log('Send Fireblocks transfer', { ...context, sendTransfer })

    validateConnection(connection)

    const transferAsset = await this.findTransferAsset(connection, sendTransfer.asset)
    if (!transferAsset) {
      throw new BrokerException({
        message: 'Transfer asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { asset: sendTransfer.asset }
      })
    }

    const source = await this.getSource(connection, sendTransfer)

    const destination = await this.getDestination(connection, transferAsset.network, sendTransfer.destination)

    this.logger.log('Resolved Fireblocks transfer source and destination', {
      ...context,
      destination,
      source,
      networkId: transferAsset.network.networkId
    })

    // NOTE: Defaults the `networkFeeAttribution` to deduct to match most
    // blockchain behaviors since Fireblocks API isn't specific about what's
    // the default value for `treatAsGrossAmount` parameter.
    //
    // IMPORTANT: This parameter can only be considered if a transaction’s asset is
    // a base asset, such as ETH or MATIC. If the asset can’t be used for
    // transaction fees, like USDC, this parameter is ignored and the fee is
    // deducted from the relevant base asset wallet in the source account.
    //
    // See https://developers.fireblocks.com/reference/createtransaction
    const networkFeeAttribution = sendTransfer.networkFeeAttribution || NetworkFeeAttribution.DEDUCT

    const transferId = sendTransfer.transferId || randomUUID()

    const data: CreateTransaction = {
      source,
      destination,
      amount: sendTransfer.amount,
      assetId: transferAsset.assetExternalId,
      customerRefId: sendTransfer.customerRefId,
      externalTxId: transferId,
      note: sendTransfer.memo,
      treatAsGrossAmount: this.getTreatAsGrossAmount(networkFeeAttribution),
      idempotencyKey: sendTransfer.idempotenceId,
      ...(isProviderSpecific(sendTransfer.providerSpecific) ? { ...sendTransfer.providerSpecific } : {})
    }

    this.logger.log('Send create transaction request to Fireblocks', { ...context, data })

    const createTransactionResponse = await this.fireblocksClient.createTransaction({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      data
    })

    this.logger.log('Fireblocks transaction created', context)

    const internalTransfer: InternalTransfer = {
      connectionId,
      transferId,
      assetId: transferAsset.assetId,
      clientId: connection.clientId,
      createdAt: new Date(),
      customerRefId: sendTransfer.customerRefId || null,
      destination: sendTransfer.destination,
      assetExternalId: transferAsset.assetExternalId,
      externalId: createTransactionResponse.id,
      externalStatus: createTransactionResponse.status,
      grossAmount: sendTransfer.amount,
      idempotenceId: sendTransfer.idempotenceId,
      memo: sendTransfer.memo || null,
      networkFeeAttribution,
      provider: Provider.FIREBLOCKS,
      providerSpecific: sendTransfer.providerSpecific || null,
      source: sendTransfer.source,
      status: this.mapStatus(createTransactionResponse.status)
    }

    this.logger.log('Create internal transfer', internalTransfer)

    await this.transferRepository.bulkCreate([internalTransfer])

    return internalTransfer
  }

  /**
   * When Fireblocks `treatAsGrossAmount` is set to `true`, the fee will be
   * deducted from the requested amount.
   *
   * Note: This parameter can only be considered if a transaction’s asset is a
   * base asset, such as ETH or MATIC. If the asset can’t be used for
   * transaction fees, like USDC, this parameter is ignored and the fee is
   * deducted from the relevant base asset wallet in the source account.
   *
   * Example: a request to transfer 5 BTC with `treatAsGrossAmount=false` would
   * result in 5 exactly BTC received to the destination and just over 5 BTC
   * spent by the source.
   *
   * @see https://developers.fireblocks.com/reference/createtransaction
   */
  private getTreatAsGrossAmount(attribution: NetworkFeeAttribution): boolean {
    if (attribution === NetworkFeeAttribution.DEDUCT) {
      return true
    }

    if (attribution === NetworkFeeAttribution.ON_TOP) {
      return false
    }

    return false
  }

  private async getSource(scope: ConnectionScope, sendTransfer: SendTransfer) {
    if (sendTransfer.source.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(scope, sendTransfer.source.id)

      if (account) {
        const wallet = await this.walletService.findById(scope, account.walletId)

        if (wallet) {
          return {
            type: 'VAULT_ACCOUNT',
            id: wallet.externalId
          }
        }
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Fireblocks transfer source',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { source: sendTransfer.source }
    })
  }

  private async getDestination(scope: ConnectionScope, network: Network, destination: Destination) {
    this.logger.log('Resolved Fireblocks destination', {
      scope,
      destination,
      network: network.networkId
    })

    if (isAddressDestination(destination)) {
      const address = await this.addressService.findByAddressAndNetwork(
        scope.clientId,
        destination.address,
        network.networkId
      )

      if (address) {
        const account = await this.accountService.findById(scope, address.accountId)

        if (account) {
          const wallet = await this.walletService.findById(scope, account.walletId)

          if (wallet) {
            return {
              type: 'VAULT_ACCOUNT',
              id: wallet.externalId
            }
          }
        }
      }

      return {
        type: 'ONE_TIME_ADDRESS',
        oneTimeAddress: {
          address: destination.address
        }
      }
    }

    if (destination.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(scope, destination.id)

      if (account) {
        const wallet = await this.walletService.findById(scope, account.walletId)

        if (wallet) {
          return {
            type: 'VAULT_ACCOUNT',
            id: wallet.externalId
          }
        }
      }
    }

    throw new BrokerException({
      message: 'Cannot resolve Fireblocks transfer destination',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { destination }
    })
  }

  private async findTransferAsset(
    connection: ConnectionWithCredentials,
    transferAsset: TransferAsset
  ): Promise<ResolvedTransferAsset> {
    validateConnection(connection)

    const findByExternalIdFallback = async (externalAssetId: string): Promise<ResolvedTransferAsset> => {
      const fbSupportedAssets = await this.fireblocksClient.getSupportedAssets({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      const fbSupportedAsset = fbSupportedAssets.find(({ id }) => id.toLowerCase() === externalAssetId.toLowerCase())
      if (!fbSupportedAsset) {
        throw new AssetException({
          message: 'Fireblocks supported asset not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset }
        })
      }

      const network = await this.networkService.findByExternalId(Provider.FIREBLOCKS, fbSupportedAsset.nativeAsset)
      if (!network) {
        throw new AssetException({
          message: 'Fireblocks supported asset network not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset, fbSupportedAsset }
        })
      }

      return {
        network,
        assetExternalId: externalAssetId,
        assetId: null
      }
    }

    const findByOnchainIdFallback = async (network: Network, onchainId: string): Promise<ResolvedTransferAsset> => {
      const externalNetwork = getExternalNetwork(network, Provider.FIREBLOCKS)
      if (!externalNetwork) {
        throw new AssetException({
          message: 'Network does not support Fireblocks',
          suggestedHttpStatusCode: HttpStatus.NOT_IMPLEMENTED,
          context: { transferAsset, network }
        })
      }

      const fbSupportedAssets = await this.fireblocksClient.getSupportedAssets({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      const fbSupportedAsset = fbSupportedAssets.find(
        ({ contractAddress, nativeAsset }) =>
          contractAddress.toLowerCase() === onchainId.toLowerCase() &&
          nativeAsset.toLowerCase() === externalNetwork.externalId.toLowerCase()
      )
      if (!fbSupportedAsset) {
        throw new AssetException({
          message: 'Fireblocks supported asset not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: { transferAsset }
        })
      }

      return {
        network,
        assetId: null,
        assetExternalId: fbSupportedAsset.id
      }
    }

    return this.transferAssetService.resolve({
      findByExternalIdFallback,
      findByOnchainIdFallback,
      transferAsset,
      provider: Provider.FIREBLOCKS
    })
  }

  private mapStatus(status: string): TransferStatus {
    const upperCasedStatus = status.toUpperCase()

    // For FB transaction statuses, see
    // https://developers.fireblocks.com/reference/gettransaction
    const statuses: Record<string, TransferStatus> = {
      SUBMITTED: TransferStatus.PROCESSING,
      PENDING_AML_SCREENING: TransferStatus.PROCESSING,
      PENDING_ENRICHMENT: TransferStatus.PROCESSING,
      PENDING_AUTHORIZATION: TransferStatus.PROCESSING,
      QUEUED: TransferStatus.PROCESSING,
      PENDING_SIGNATURE: TransferStatus.PROCESSING,
      PENDING_3RD_PARTY_MANUAL_APPROVAL: TransferStatus.PROCESSING,
      PENDING_3RD_PARTY: TransferStatus.PROCESSING,
      BROADCASTING: TransferStatus.PROCESSING,
      CONFIRMING: TransferStatus.PROCESSING,
      CANCELLING: TransferStatus.PROCESSING,

      COMPLETED: TransferStatus.SUCCESS,

      CANCELLED: TransferStatus.FAILED,
      BLOCKED: TransferStatus.FAILED,
      REJECTED: TransferStatus.FAILED,
      FAILED: TransferStatus.FAILED
    }

    if (upperCasedStatus in statuses) {
      return statuses[upperCasedStatus]
    }

    throw new BrokerException({
      message: 'Cannot map Fireblocks transaction status',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { status: upperCasedStatus }
    })
  }
}
