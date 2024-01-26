import { AssetId, AssetType, toAssetId } from '@narval/authz-shared'
import { toAccountIdLowerCase } from 'packages/transaction-request-intent/src/lib/utils'
import { Intents, NativeTransferInput, SupportedChains } from '../../../domain'
import { TransactionRequestIntentError } from '../../../error'
import { TransferNative } from '../../../intent.types'
import DecoderStrategy from '../../DecoderStrategy'

export default class NativeTransferDecoder extends DecoderStrategy {
  #input: NativeTransferInput
  #checkCancelTransaction(): Intents {
    const { from, to, value } = this.#input
    if (from === to && (value === '0x0' || value === '0x')) {
      return Intents.CANCEL_TRANSACTION
    }
    return Intents.TRANSFER_NATIVE
  }

  #nativeCaip19(chainId: number): AssetId {
    if (chainId !== SupportedChains.ETHEREUM && chainId !== SupportedChains.POLYGON) {
      throw new TransactionRequestIntentError({
        message: 'Invalid chainId',
        status: 400,
        context: {
          chainId
        }
      })
    }

    // TODO: FIX ME
    // const address = chainId === SupportedChains.ETHEREUM ? Slip44SupportedAddresses.ETH : Slip44SupportedAddresses.MATIC
    return toAssetId({
      chainId,
      assetType: AssetType.SLIP44,
      coinType: 60
    })
  }
  constructor(input: NativeTransferInput) {
    super(input)
    this.#input = input
  }

  decode() {
    const { to, from, value, chainId } = this.#input
    const type = this.#checkCancelTransaction()
    if (type === Intents.CANCEL_TRANSACTION) {
      return {
        type
      }
    }
    const intent: TransferNative = {
      to: toAccountIdLowerCase({
        chainId,
        address: to
      }),
      from: toAccountIdLowerCase({
        chainId,
        address: from
      }),
      type: Intents.TRANSFER_NATIVE,
      amount: Number(value).toString(),
      token: this.#nativeCaip19(chainId)
    }
    return intent
  }
}
