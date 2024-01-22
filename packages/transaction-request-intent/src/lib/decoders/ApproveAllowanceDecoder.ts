import { encodeEoaAccountId } from '../caip'
import { ContractCallInput, Intents } from '../domain'
import { ApproveAllowanceParams } from '../extraction/types'
import { ApproveTokenAllowance } from '../intent.types'
import { isSupportedMethodId } from '../typeguards'
import DecoderStrategy from './DecoderStrategy'

export default class ApproveTokenAllowanceDecoder extends DecoderStrategy {
  #input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.#input = input
  }

  decode(): ApproveTokenAllowance {
    const { from, to, chainId, data, methodId } = this.#input
    if (!isSupportedMethodId(methodId)) {
      throw new Error('Unsupported methodId')
    }
    const params = this.extract(data, methodId) as ApproveAllowanceParams
    try {
      const { amount, spender } = params
      const intent: ApproveTokenAllowance = {
        spender: encodeEoaAccountId({ chainId, evmAccountAddress: spender }),
        from: encodeEoaAccountId({ chainId, evmAccountAddress: from }),
        type: Intents.APPROVE_TOKEN_ALLOWANCE,
        amount,
        token: encodeEoaAccountId({ chainId, evmAccountAddress: to })
      }
      return intent
    } catch {
      throw new Error('Params do not match ERC20 transfer methodId')
    }
  }
}
