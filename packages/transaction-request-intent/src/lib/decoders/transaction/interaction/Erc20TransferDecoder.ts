import { ContractCallInput, Intents } from '../../../domain'
import { TransferParams } from '../../../extraction/types'
import { TransferErc20 } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeErc20Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc20 => {
  const { from, to, chainId, data, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new Error('Unsupported methodId')
  }

  const params = extract(supportedMethods, data, methodId) as TransferParams
  const { amount, recipient } = params

  const intent: TransferErc20 = {
    to: toAccountIdLowerCase({ chainId, address: recipient }),
    from: toAccountIdLowerCase({ chainId, address: from }),
    type: Intents.TRANSFER_ERC20,
    amount,
    token: toAccountIdLowerCase({ chainId, address: to })
  }

  return intent
}
