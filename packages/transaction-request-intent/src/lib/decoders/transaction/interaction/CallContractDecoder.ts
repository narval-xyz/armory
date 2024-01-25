import { toCaip10Lower } from '@narval/authz-shared'
import { ContractCallInput, Intents } from '../../../domain'
import { CallContract } from '../../../intent.types'
import DecoderStrategy from '../../DecoderStrategy'

export default class CallContractDecoder extends DecoderStrategy {
  #input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.#input = input
  }

  decode(): CallContract {
    const { to, from, chainId, methodId } = this.#input
    const intent: CallContract = {
      from: toCaip10Lower({ chainId, address: from }),
      contract: toCaip10Lower({ chainId, address: to }),
      type: Intents.CALL_CONTRACT,
      hexSignature: methodId
    }
    return intent
  }
}
