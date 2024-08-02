import { ContractCallInput, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { ApproveAllowanceParams } from '../../../extraction/types'
import { ApproveTokenAllowance } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toChainAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeApproveTokenAllowance = (
  input: ContractCallInput,
  supportedMethods: MethodsMapping // Assuming this is defined elsewhere to check supported method IDs
): ApproveTokenAllowance => {
  const { from, to, chainId, data, methodId } = input

  if (!isSupportedMethodId(methodId)) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }

  const params = extract(supportedMethods, data, methodId) as ApproveAllowanceParams
  if (!params) {
    throw new DecoderError({ message: 'Params do not match ERC20 transfer methodId', status: 400 })
  }

  const { amount, spender } = params

  const intent: ApproveTokenAllowance = {
    spender: toChainAccountIdLowerCase({ chainId, address: spender }),
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    type: Intents.APPROVE_TOKEN_ALLOWANCE,
    amount,
    token: toChainAccountIdLowerCase({ chainId, address: to })
  }

  return intent
}
