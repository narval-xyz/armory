import { Address, AssetType, Caip19Id, Slip44SupportedAddresses, toCaip10Lower, toCaip19 } from '@narval/authz-shared'
import { Intents, NativeTransferInput, SupportedChains } from '../../domain'
import { TransactionRequestIntentError } from '../../error'
import { TransferNative } from '../../intent.types'
import DecoderStrategy from '../DecoderStrategy'

export default class NativeTransferDecoder extends DecoderStrategy {
  #input: NativeTransferInput
  #checkCancelTransaction(): Intents {
    const { from, to, value } = this.#input
    if (from === to && (value === '0x0' || value === '0x')) {
      return Intents.CANCEL_TRANSACTION
    }
    return Intents.TRANSFER_NATIVE
  }

  #nativeCaip19(chainId: number): Caip19Id {
    if (chainId !== SupportedChains.ETHEREUM && chainId !== SupportedChains.POLYGON) {
      throw new TransactionRequestIntentError({
        message: 'Invalid chainId',
        status: 400,
        context: {
          chainId
        }
      })
    }
    const address = chainId === SupportedChains.ETHEREUM ? Slip44SupportedAddresses.ETH : Slip44SupportedAddresses.MATIC
    return toCaip19({
      chainId,
      assetType: AssetType.SLIP44,
      address: address.toLowerCase() as unknown as Address
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
      to: toCaip10Lower({
        chainId,
        address: to
      }),
      from: toCaip10Lower({
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
