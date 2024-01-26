import { ContractCallInput, Intents } from '../../../domain'
import { ApproveAllowanceParams } from '../../../extraction/types'
import { ApproveTokenAllowance } from '../../../intent.types'
import { isSupportedMethodId } from '../../../typeguards'
import { toAccountIdLowerCase } from '../../../utils'
import DecoderStrategy from '../../DecoderStrategy'

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
        spender: toAccountIdLowerCase({ chainId, address: spender }),
        from: toAccountIdLowerCase({ chainId, address: from }),
        type: Intents.APPROVE_TOKEN_ALLOWANCE,
        amount,
        // TODO: FIX ME
        token: 'eip155:1/erc20:0x5db3Bf14413d7e3c69FAA279EFa1D1B08637eC4c'
        // token: toAssetIdLowerCase({ chainId, address: to })
      }
      return intent
    } catch {
      throw new Error('Params do not match ERC20 transfer methodId')
    }
  }
}
