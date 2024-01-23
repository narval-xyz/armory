import { encodeEoaAccountId } from '../../../caip'
import { ContractCallInput, Intents } from '../../../domain'
import { TransferParams } from '../../../extraction/types'
import { TransferErc20 } from '../../../intent.types'
import { isSupportedMethodId } from '../../../typeguards'
import DecoderStrategy from '../../DecoderStrategy'

export default class Erc20TransferDecoder extends DecoderStrategy {
  #input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.#input = input
  }

  decode(): TransferErc20 {
    const { from, to, chainId, data, methodId } = this.#input
    if (!isSupportedMethodId(methodId)) {
      throw new Error('Unsupported methodId')
    }
    const params = this.extract(data, methodId) as TransferParams
    try {
      const { amount, recipient } = params
      const intent: TransferErc20 = {
        to: encodeEoaAccountId({ chainId, evmAccountAddress: recipient }),
        from: encodeEoaAccountId({ chainId, evmAccountAddress: from }),
        type: Intents.TRANSFER_ERC20,
        amount,
        contract: encodeEoaAccountId({ chainId, evmAccountAddress: to })
      }

      return intent
    } catch {
      throw new Error('Params do not match ERC20 transfer methodId')
    }
  }
}
