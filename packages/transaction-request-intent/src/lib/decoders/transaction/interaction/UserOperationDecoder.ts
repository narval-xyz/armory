import { Address, Intent, Intents, toCaip10 } from '@narval/authz-shared'
import { Hex } from 'viem'
import { ContractCallInput, InputType } from '../../../domain'
import { ExecuteParams, HandleOpsParams } from '../../../extraction/types'
import { UserOperation } from '../../../intent.types'
import { SupportedMethodId } from '../../../supported-methods'
import { assertAddress, assertHexString, isSupportedMethodId } from '../../../typeguards'
import { getMethodId } from '../../../utils'
import Decoder from '../../Decoder'
import DecoderStrategy from '../../DecoderStrategy'

export default class UserOperationDecoder extends DecoderStrategy {
  #input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.#input = input
  }

  #decodeExecute(callData: Hex, from: Address, chainId: number): Intent {
    const dataWithoutMethodId = `0x${callData.slice(10)}` as Hex
    const params = this.extract(dataWithoutMethodId, SupportedMethodId.EXECUTE) as ExecuteParams
    const { to, value, data } = params
    const decoder = new Decoder()
    const decodedExecute = decoder.decode({
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        to: assertAddress(to),
        from: assertAddress(from),
        value: assertHexString(value),
        data: assertHexString(data),
        chainId
      }
    })
    return decodedExecute
  }

  decode(): UserOperation {
    const { from, chainId, data, to, methodId } = this.#input
    if (!isSupportedMethodId(methodId)) {
      throw new Error('Unsupported methodId')
    }
    const params = this.extract(data, methodId) as HandleOpsParams
    const intents: Intent[] = []
    const { userOps, beneficiary } = params
    for (let i = 0; i < userOps.length; i++) {
      const userOp = userOps[i]
      const callDataMethodId = getMethodId(userOp.callData)
      if (callDataMethodId === SupportedMethodId.EXECUTE) {
        const intent = this.#decodeExecute(userOp.callData, from, chainId)
        intents.push(intent)
      }
    }
    const intent: UserOperation = {
      type: Intents.USER_OPERATION,
      from: toCaip10({ chainId, address: from }),
      entrypoint: toCaip10({ chainId, address: to }),
      operationIntents: intents,
      beneficiary
    }
    return intent
  }
}
