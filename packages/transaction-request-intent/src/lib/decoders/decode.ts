import { toChainAccountId } from '@narval/policy-engine-shared'
import { CHAINS } from '../__test__/default-chains'
import {
  Config,
  ConfigInput,
  ContractCallInput,
  DecodeInput,
  InputType,
  Intents,
  SafeDecodeOutput,
  TransactionCategory,
  TransactionInput,
  TransactionStatus,
  TypedDataInput
} from '../domain'
import { DecoderError } from '../error'
import { Intent, TypedDataIntent } from '../intent.types'
import { ChainRegistry } from '../registry/chain-registry'
import { ContractRegistry } from '../registry/contract-registry'
import { TransactionKey, TransactionRegistry } from '../registry/transaction-registry'
import { MethodsMapping, SUPPORTED_METHODS } from '../supported-methods'
import { isSupportedMethodId } from '../typeguards'
import {
  decodeMessage,
  decodePermit,
  decodePermit2,
  decodeTypedData,
  getCategory,
  getMethodId,
  getTransactionIntentType
} from '../utils'
import {
  validateContractDeploymentInput,
  validateContractInteractionInput,
  validateNativeTransferInput
} from '../validators'
import { decodeContractDeployment } from './transaction/deployment/DeployContract'
import { decodeApproveTokenAllowance } from './transaction/interaction/ApproveAllowanceDecoder'
import { decodeCallContract } from './transaction/interaction/CallContractDecoder'
import { decodeERC1155Transfer } from './transaction/interaction/Erc1155TransferDecoder'
import { decodeErc20Transfer } from './transaction/interaction/Erc20TransferDecoder'
import { decodeErc721Transfer } from './transaction/interaction/Erc721TransferDecoder'
import { decodeUserOperation } from './transaction/interaction/UserOperationDecoder'
import { decodeNativeTransfer } from './transaction/native/NativeTransferDecoder'

const decodeContractCall = (input: ContractCallInput, intent: Intents, supportedMethods: MethodsMapping) => {
  if (!isSupportedMethodId(input.methodId)) {
    return decodeCallContract(input)
  }
  switch (intent) {
    case Intents.TRANSFER_ERC20:
      return decodeErc20Transfer(input, supportedMethods)
    case Intents.TRANSFER_ERC721:
      return decodeErc721Transfer(input, supportedMethods)
    case Intents.TRANSFER_ERC1155:
      return decodeERC1155Transfer(input, supportedMethods)
    case Intents.APPROVE_TOKEN_ALLOWANCE:
      return decodeApproveTokenAllowance(input, supportedMethods)
    case Intents.USER_OPERATION:
      return decodeUserOperation(input, supportedMethods)
    case Intents.CALL_CONTRACT:
    default:
      return decodeCallContract(input)
  }
}

const decodeTransactionInput = (
  input: TransactionInput,
  supportedMethods: MethodsMapping,
  chains: ChainRegistry,
  contractRegistry?: ContractRegistry
) => {
  const { txRequest } = input
  const { data, to, value } = txRequest
  const methodId = getMethodId(data)
  const category = getCategory(methodId, to, value)

  switch (category) {
    case TransactionCategory.NATIVE_TRANSFER: {
      const validatedTxRequest = validateNativeTransferInput(txRequest)
      return decodeNativeTransfer(validatedTxRequest, chains)
    }
    case TransactionCategory.CONTRACT_INTERACTION: {
      const validatedTxRequest = validateContractInteractionInput(txRequest, methodId)
      const intent = getTransactionIntentType({
        methodId,
        txRequest: validatedTxRequest,
        contractRegistry
      })
      return decodeContractCall(validatedTxRequest, intent, supportedMethods)
    }
    case TransactionCategory.CONTRACT_CREATION: {
      const validatedTxRequest = validateContractDeploymentInput(txRequest)
      return decodeContractDeployment(validatedTxRequest, contractRegistry)
    }
  }
}

const wrapTransactionManagementIntents = (
  intent: Intent,
  input: TransactionInput,
  transactionRegistry?: TransactionRegistry
): Intent => {
  const { txRequest } = input
  if (
    !transactionRegistry ||
    transactionRegistry.size === 0 ||
    !txRequest.nonce ||
    intent.type === Intents.CANCEL_TRANSACTION
  )
    return intent
  const { chainId, from, nonce } = txRequest
  const key = TransactionKey.parse([toChainAccountId({ chainId, address: from }), nonce])
  const trxStatus = transactionRegistry.get(key)
  if (trxStatus === TransactionStatus.FAILED) {
    return {
      type: Intents.RETRY_TRANSACTION
    }
  }
  throw new DecoderError({
    message: 'Transaction already executed',
    status: 400,
    context: {
      txRequest,
      originalTrxStatus: trxStatus
    }
  })
}

const decodeTypedDataInput = (input: TypedDataInput): TypedDataIntent => {
  const { typedData } = input
  const { primaryType } = typedData
  switch (primaryType) {
    case 'Permit2': {
      const decoded = decodePermit2(typedData)
      return decoded || decodeTypedData(typedData)
    }
    case 'Permit': {
      const decoded = decodePermit(typedData)
      return decoded || decodeTypedData(typedData)
    }
    default:
      return decodeTypedData(typedData)
  }
}

export const prepareConfig = (config: ConfigInput): Config => {
  const { chainRegistryInput, contractRegistryInput, transactionRegistryInput, supportedMethods } = config
  const chainRegistry = new ChainRegistry(chainRegistryInput || CHAINS)
  const contractRegistry = new ContractRegistry(contractRegistryInput)
  const transactionRegistry = new TransactionRegistry(transactionRegistryInput)
  return {
    chainRegistry,
    contractRegistry,
    transactionRegistry,
    supportedMethods: supportedMethods || SUPPORTED_METHODS
  }
}

const decode = ({ input, configInput = {} }: { input: DecodeInput; configInput?: ConfigInput }): Intent => {
  const { chainRegistry, contractRegistry, transactionRegistry, supportedMethods } = prepareConfig(configInput)

  switch (input.type) {
    case InputType.TRANSACTION_REQUEST: {
      const decoded = decodeTransactionInput(input, supportedMethods, chainRegistry, contractRegistry)
      return wrapTransactionManagementIntents(decoded, input, transactionRegistry)
    }
    case InputType.TYPED_DATA:
      return decodeTypedDataInput(input)
    case InputType.MESSAGE:
      return decodeMessage(input)
    case InputType.RAW:
      return {
        type: Intents.SIGN_RAW,
        algorithm: input.raw.algorithm,
        payload: input.raw.payload
      }
    default:
      throw new DecoderError({ message: 'Invalid input type', status: 400 })
  }
}

const safeDecode = ({
  input,
  configInput = {}
}: {
  input: DecodeInput
  configInput?: ConfigInput
}): SafeDecodeOutput => {
  try {
    const intent = decode({ input, configInput })
    return {
      success: true,
      intent
    }
  } catch (error) {
    if (error instanceof DecoderError) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          context: error.context || {}
        }
      }
    }
    return {
      success: false,
      error: {
        message: 'Unknown error',
        status: 500,
        context: {
          error
        }
      }
    }
  }
}

export { decode, safeDecode }
