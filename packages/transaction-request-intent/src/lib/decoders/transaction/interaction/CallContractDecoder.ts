import { ContractCallInput, Intents } from '../../../domain'
import { CallContract } from '../../../intent.types'
import { toChainAccountIdLowerCase } from '../../../utils'

export const decodeCallContract = (input: ContractCallInput): CallContract => {
  const { to, from, chainId, methodId } = input

  const intent: CallContract = {
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    contract: toChainAccountIdLowerCase({ chainId, address: to }),
    type: Intents.CALL_CONTRACT,
    hexSignature: methodId
  }

  return intent
}
