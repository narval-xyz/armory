import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { BitGoTransferType, BitgoClient } from '../../../http/client/bitgo.client'
import { TransferRepository } from '../../../persistence/repository/transfer.repository'
import { BrokerException } from '../../exception/broker.exception'
import { AccountService } from '../../service/account.service'
import { AddressService } from '../../service/address.service'
import { AssetService } from '../../service/asset.service'
import { NetworkService } from '../../service/network.service'
import { ResolvedTransferAsset } from '../../service/transfer-asset.service'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { ExternalNetwork } from '../../type/network.type'
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
  isAddressDestination
} from '../../type/transfer.type'
import { ValidConnection, decideState, mapBitgoStateToInternalStatus, validateConnection } from './bitgo.util'

type BitGoResolvedTransferAsset = Omit<ResolvedTransferAsset, 'assetId'> & {
  assetId: string
  decimals: number
  contractAddress?: string
}

@Injectable()
export class BitgoTransferService implements ProviderTransferService {
  constructor(
    private readonly bitgoClient: BitgoClient,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly networkService: NetworkService,
    private readonly transferRepository: TransferRepository,
    private readonly assetService: AssetService,
    private readonly logger: LoggerService
  ) {}

  async findById(connection: ConnectionWithCredentials, id: string): Promise<Transfer> {
    validateConnection(connection)
    const transfer = await this.transferRepository.findById(connection.clientId, id)

    if (!transfer) {
      throw new BrokerException({
        message: 'Transfer not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { connectionId: connection.connectionId, id }
      })
    }

    const { source } = transfer

    let account
    if (source.type === TransferPartyType.ACCOUNT) {
      account = await this.accountService.findById(connection, source.id)
    } else if (source.type === TransferPartyType.WALLET) {
      throw new BrokerException({
        message: 'Wallet does not exist in Bitgo. This is an invalid state',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { connectionId: connection.connectionId, source }
      })
    } else if (source.type === TransferPartyType.ADDRESS) {
      const address = await this.addressService.findById(connection, source.id)
      account = await this.accountService.findById(connection, address.accountId)
    }

    if (!account) {
      throw new BrokerException({
        message: 'Account not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { connectionId: connection.connectionId, source }
      })
    }

    if (!transfer.assetExternalId) {
      throw new BrokerException({
        message: 'Asset not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { connectionId: connection.connectionId, transfer }
      })
    }

    transfer.externalId

    const events = await this.bitgoClient.getTransaction({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      data: {
        txRequestIds: [transfer.externalId],
        walletId: account.externalId
      }
    })

    this.logger.error('Fees are not supported for Bitgo transfers', { transfer })

    const states = events.map((ext) => mapBitgoStateToInternalStatus(ext.state))

    return {
      ...transfer,
      status: decideState(states),
      fees: []
    }
  }

  private async getSource(scope: ConnectionScope, source: Source) {
    if (source.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(scope, source.id)
      return account.externalId
    }

    throw new BrokerException({
      message: 'Cannot resolve Bitgo transfer source',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { scope, source }
    })
  }

  private async getDestination(connection: ValidConnection, destination: Destination) {
    if (isAddressDestination(destination)) {
      return destination.address
    }

    if (destination.type === TransferPartyType.ACCOUNT) {
      const account = await this.accountService.findById(connection, destination.id)

      if (!account) {
        throw new BrokerException({
          message: 'Account not found',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          context: { scope: connection, destination }
        })
      }

      const { addresses } = account

      if (!addresses || !addresses.length) {
        throw new BrokerException({
          message: 'Account does not have any addresses',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          context: { scope: connection, destination }
        })
      }

      if (addresses.length !== 1) {
        const bitgoWallet = await this.bitgoClient.getWallets({
          url: connection.url,
          apiKey: connection.credentials.apiKey,
          options: {
            walletIds: [account.externalId]
          }
        })

        if (!bitgoWallet || bitgoWallet.length !== 1) {
          throw new BrokerException({
            message: 'Could not resolve an address for this account',
            suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            context: { account }
          })
        }

        return bitgoWallet[0].receiveAddress.address
      }

      return addresses[0].address
    }

    throw new BrokerException({
      message: 'Cannot resolve Bitgo transfer destination',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { scope: connection, destination }
    })
  }

  private async findAsset(transferAsset: TransferAsset): Promise<BitGoResolvedTransferAsset> {
    if (transferAsset.assetId) {
      const asset = await this.assetService.findById(transferAsset.assetId)
      if (asset?.decimals) {
        const network = await this.networkService.findById(asset.networkId)
        const bitGoAssetId = asset.externalAssets.find(
          (externalAsset) => externalAsset.provider === Provider.BITGO
        )?.externalId
        if (bitGoAssetId && network) {
          return {
            assetExternalId: bitGoAssetId,
            decimals: asset.decimals,
            network,
            assetId: asset.assetId,
            contractAddress: asset.onchainId || undefined
          }
        }
      }
    }

    if (transferAsset.address && transferAsset.networkId) {
      const asset = await this.assetService.findByOnchainId(transferAsset.networkId, transferAsset.address)
      if (asset?.decimals) {
        const network = await this.networkService.findById(asset.networkId)
        const bitGoAssetId = asset.externalAssets.find(
          (externalAsset) => externalAsset.provider === Provider.BITGO
        )?.externalId
        if (bitGoAssetId && network) {
          return {
            assetExternalId: bitGoAssetId,
            decimals: asset.decimals,
            network,
            assetId: asset.assetId,
            contractAddress: asset.onchainId || undefined
          }
        }
      }
    }

    if (transferAsset.externalAssetId) {
      const asset = await this.assetService.findByExternalId(Provider.BITGO, transferAsset.externalAssetId)
      if (asset?.decimals) {
        const network = await this.networkService.findById(asset.networkId)

        if (network) {
          return {
            assetExternalId: transferAsset.externalAssetId,
            decimals: asset.decimals,
            network,
            assetId: asset.assetId,
            contractAddress: asset.onchainId || undefined
          }
        }
      }
    }

    throw new BrokerException({
      message: 'Cannot find transfer asset',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { transferAsset }
    })
  }

  private async findTransferNetwork(transferAsset: TransferAsset): Promise<ExternalNetwork> {
    const { network } = await this.findAsset(transferAsset)

    const bitgoNetwork = network.externalNetworks.find((externalNetwork) => externalNetwork.provider === Provider.BITGO)
    if (!bitgoNetwork) {
      throw new BrokerException({
        message: 'Cannot find Bitgo network',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { transferAsset }
      })
    }

    return bitgoNetwork
  }

  async send(connection: ConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    validateConnection(connection)
    const now = new Date()
    const {
      amount,
      source,
      destination,
      asset: transferAsset,
      memo,
      transferId,
      idempotenceId,
      customerRefId
    } = sendTransfer

    const walletId = await this.getSource(connection, source)
    const address = await this.getDestination(connection, destination)

    const asset = await this.findAsset(transferAsset)

    const native = await this.assetService.findNative(asset.network.networkId)

    const { externalId: coin } = await this.findTransferNetwork(transferAsset)

    const networkFeeAttribution = sendTransfer.networkFeeAttribution || NetworkFeeAttribution.ON_TOP

    const transferType = asset.assetId === native?.assetId ? BitGoTransferType.NATIVE : BitGoTransferType.TOKEN

    const amountInBaseUnits = this.assetService.toBaseUnit(amount, +asset.decimals)

    const res = await this.bitgoClient.createTransfer({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      walletPassphrase: connection.credentials.walletPassphrase,
      data: {
        walletId,
        coin,
        amount: amountInBaseUnits,
        address,
        asset: asset.assetExternalId,
        tokenContractAddress: asset.contractAddress || undefined,
        type: transferType,
        networkFeeAttribution,
        idempotenceId,
        decimals: asset.decimals
      }
    })

    const internalTransfer: InternalTransfer = {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      provider: Provider.BITGO,
      createdAt: now,
      assetExternalId: asset.assetExternalId,
      assetId: asset.assetId,
      customerRefId: customerRefId || null,
      destination,
      source,
      status: mapBitgoStateToInternalStatus(res.state),
      grossAmount: amount,
      idempotenceId,
      memo: memo || null,
      transferId: transferId || randomUUID(),
      externalId: res.txRequestId,
      externalStatus: res.state,
      networkFeeAttribution
    }

    await this.transferRepository.bulkCreate([internalTransfer])

    return internalTransfer
  }
}
