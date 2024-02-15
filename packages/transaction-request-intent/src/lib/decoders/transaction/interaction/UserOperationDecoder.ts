import { Address, assertAddress, assertHexString } from '@narval/authz-shared'
import { Hex, toHex } from 'viem'
import { ContractCallInput, InputType, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { ExecuteAndRevertParams, ExecuteParams, HandleOpsParams } from '../../../extraction/types'
import { Intent, UserOperation } from '../../../intent.types'
import { MethodsMapping, SupportedMethodId } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { getMethodId, toAccountIdLowerCase } from '../../../utils'
import { decode } from '../../decode'
import { extract } from '../../utils'

// Function to handle the 'EXECUTE' operation decoding
const decodeExecute = (callData: Hex, from: Address, chainId: number, supportedMethods: MethodsMapping): Intent => {
  const dataWithoutMethodId = `0x${callData.slice(10)}` as Hex
  const params = extract(supportedMethods, dataWithoutMethodId, SupportedMethodId.EXECUTE) as ExecuteParams
  const { to, value, data } = params

  const assertAddressTo = assertAddress(to)
  const assertAddressfrom = assertAddress(from)
  const assertAddressValue = assertHexString(value)
  const assertData = assertHexString(data)

  if (!assertAddressTo || !assertAddressfrom || !assertAddressValue || !assertData) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return decode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        to: assertAddressTo,
        from: assertAddressfrom,
        value: assertAddressValue,
        data: assertData,
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
  const dataWithoutMethodId = `0x${callData.slice(10)}` as Hex
  const params = extract(
    supportedMethods,
    dataWithoutMethodId,
    SupportedMethodId.EXECUTE_AND_REVERT
  ) as ExecuteAndRevertParams
  const { to, value, data } = params

  const assertAddressTo = assertAddress(to)
  const assertAddressfrom = assertAddress(from)
  const assertValue = toHex(value)
  const assertData = assertHexString(data)

  if (!assertAddressTo || !assertAddressfrom || !assertData) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return decode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        to: assertAddressTo,
        from: assertAddressfrom,
        value: assertValue,
        data: assertData,
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

  const params = extract(supportedMethods, data, methodId) as HandleOpsParams
  const intents: Intent[] = []
  const { userOps, beneficiary } = params

  userOps.forEach((userOp) => {
    const callDataMethodId = getMethodId(userOp.callData)
    let intent
    if (callDataMethodId === SupportedMethodId.EXECUTE) {
      intent = decodeExecute(userOp.callData, from, chainId, supportedMethods)
    } else if (callDataMethodId === SupportedMethodId.EXECUTE_AND_REVERT) {
      intent = decodeExecuteAndRevert(userOp.callData, from, chainId, supportedMethods)
    }
    if (intent) intents.push(intent)
  })

  return {
    type: Intents.USER_OPERATION,
    from: toAccountIdLowerCase({ chainId, address: from }),
    entrypoint: toAccountIdLowerCase({ chainId, address: to }),
    operationIntents: intents,
    beneficiary
  }
}
