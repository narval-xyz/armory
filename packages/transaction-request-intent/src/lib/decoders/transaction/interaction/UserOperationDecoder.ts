import { Address } from '@narval/policy-engine-shared'
import { Hex, toHex } from 'viem'
import { ContractCallInput, InputType, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { ExecuteAndRevertParams, ExecuteParams } from '../../../extraction/types'
import { Intent, UserOperation } from '../../../intent.types'
import { MethodsMapping, SupportedMethodId } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toChainAccountIdLowerCase } from '../../../utils'
import { decode } from '../../decode'
import { extract } from '../../utils'

// Function to handle the 'EXECUTE' operation decoding
const decodeExecute = (callData: Hex, from: Address, chainId: number, supportedMethods: MethodsMapping): Intent => {
  const params = extract(supportedMethods, callData, SupportedMethodId.EXECUTE) as ExecuteParams
  const { to, value, data } = params

  const valueHex = toHex(value)
  return decode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        to,
        from,
        value: toHex(value),
        data,
        chainId
      }
    },
    config: {
      supportedMethods
    }
  })
}

// Function to handle the 'EXECUTE_AND_REVERT' operation decoding
const decodeExecuteAndRevert = (
  callData: Hex,
  from: Address,
  chainId: number,
  supportedMethods: MethodsMapping
): Intent => {
  const params = extract(supportedMethods, callData, SupportedMethodId.EXECUTE_AND_REVERT) as ExecuteAndRevertParams
  const { to, value, data } = params

  return decode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        to,
        from,
        value: toHex(value),
        data,
        chainId
      }
    },
    config: {
      supportedMethods
    }
  })
}

// Main function to decode user operations
export const decodeUserOperation = (input: ContractCallInput, supportedMethods: MethodsMapping): UserOperation => {
  const { from, chainId, data, to, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }

  const intents: Intent[] = []

  if (methodId === SupportedMethodId.EXECUTE) {
    intents.push(decodeExecute(data, from, chainId, supportedMethods))
  } else if (methodId === SupportedMethodId.EXECUTE_AND_REVERT) {
    intents.push(decodeExecuteAndRevert(data, from, chainId, supportedMethods))
  }
  // TODO: Support ExecuteBatchV6 and ExecuteBatchV7 here
  return {
    type: Intents.USER_OPERATION,
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    entrypoint: toChainAccountIdLowerCase({ chainId, address: to }),
    operationIntents: intents
  }
}
