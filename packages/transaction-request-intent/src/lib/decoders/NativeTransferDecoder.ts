import { Caip19, encodeEoaAccountId } from '../caip'
import { Intents, NativeTransferInput } from '../domain'
import { TransactionRequestIntentError } from '../error'
import { TransferNative } from '../intent.types'
import DecoderStrategy from './DecoderStrategy'

export default class NativeTransferDecoder extends DecoderStrategy {
  #input: NativeTransferInput
  #nativeCaip19(chainId: number): Caip19 {
    if (chainId === 1) {
      return 'eip155:1/slip44/60' as Caip19
    } else if (chainId === 137) {
      return 'eip155:137/slip44/966' as Caip19
    }
    throw new TransactionRequestIntentError({
      message: 'Invalid chainId',
      status: 400,
      context: {
        chainId
      }
    })
  }
  constructor(input: NativeTransferInput) {
    super(input)
    this.#input = input
  }

  decode() {
    const { to, from, value, chainId } = this.#input
    const intent: TransferNative = {
      to: encodeEoaAccountId({
        chainId,
        evmAccountAddress: to
      }),
      from: encodeEoaAccountId({
        chainId,
        evmAccountAddress: from
      }),
      type: Intents.TRANSFER_NATIVE,
      amount: Number(value).toString(),
      token: this.#nativeCaip19(chainId)
    }
    return intent
  }
}
