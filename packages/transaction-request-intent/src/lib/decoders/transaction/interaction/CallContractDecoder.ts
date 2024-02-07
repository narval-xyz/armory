import { ContractCallInput, Intents } from '../../../domain'
import { CallContract } from '../../../intent.types'
import { toAccountIdLowerCase } from '../../../utils'

export const decodeCallContract = (input: ContractCallInput): CallContract => {
  const { to, from, chainId, methodId } = input

  const intent: CallContract = {
    from: toAccountIdLowerCase({ chainId, address: from }),
    contract: toAccountIdLowerCase({ chainId, address: to }),
    type: Intents.CALL_CONTRACT,
    hexSignature: methodId
  }

  return intent
}
