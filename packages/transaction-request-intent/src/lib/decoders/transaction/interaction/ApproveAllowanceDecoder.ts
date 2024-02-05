import { ContractCallInput, Intents } from '../../../domain'
import { ApproveAllowanceParams } from '../../../extraction/types'
import { ApproveTokenAllowance } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeApproveTokenAllowance = (
  input: ContractCallInput,
  supportedMethods: MethodsMapping // Assuming this is defined elsewhere to check supported method IDs
): ApproveTokenAllowance => {
  const { from, to, chainId, data, methodId } = input

  if (!isSupportedMethodId(methodId)) {
    throw new Error('Unsupported methodId')
  }

  const params = extract(supportedMethods, data, methodId) as ApproveAllowanceParams
  if (!params) {
    throw new Error('Params do not match ERC20 transfer methodId')
  }

  const { amount, spender } = params

  const intent: ApproveTokenAllowance = {
    spender: toAccountIdLowerCase({ chainId, address: spender }),
    from: toAccountIdLowerCase({ chainId, address: from }),
    type: Intents.APPROVE_TOKEN_ALLOWANCE,
    amount,
    token: toAccountIdLowerCase({ chainId, address: to })
  }

  return intent
}
