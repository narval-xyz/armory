import {
  ContractCallInput,
  ContractRegistry,
  DecodeInput,
  InputType,
  Intents,
  SafeDecodeOutput,
  TransactionCategory,
  TransactionInput,
  TransactionRegistry,
  TransactionStatus,
  TypedDataInput
} from '../domain'
import { TransactionRequestIntentError } from '../error'
import { Intent, TypedDataIntent } from '../intent.types'
import { isSupportedMethodId } from '../typeguards'
import { decodeTypedData, getCategory, getMethodId, getTransactionIntentType, transactionLookup } from '../utils'
import {
  validateContractDeploymentInput,
  validateContractInteractionInput,
  validateNativeTransferInput
} from '../validators'
import DecoderStrategy from './DecoderStrategy'
import DeployContractDecoder from './transaction/deployment/DeployContract'
import ApproveTokenAllowanceDecoder from './transaction/interaction/ApproveAllowanceDecoder'
import CallContractDecoder from './transaction/interaction/CallContractDecoder'
import ERC1155TransferDecoder from './transaction/interaction/Erc1155TransferDecoder'
import Erc20TransferDecoder from './transaction/interaction/Erc20TransferDecoder'
import Erc721TransferDecoder from './transaction/interaction/Erc721TransferDecoder'
import UserOperationDecoder from './transaction/interaction/UserOperationDecoder'
import NativeTransferDecoder from './transaction/native/NativeTransferDecoder'

export type DecoderOption = {
  contractRegistry?: ContractRegistry
  transactionRegistry?: TransactionRegistry
}

export default class Decoder {
  contractRegistry?: ContractRegistry

  transactionRegistry?: TransactionRegistry

  #findContractCallStrategy(input: ContractCallInput, intent: Intents): DecoderStrategy {
    if (!isSupportedMethodId(input.methodId)) {
      return new CallContractDecoder(input)
    }
    switch (intent) {
      case Intents.TRANSFER_ERC20:
        return new Erc20TransferDecoder(input)
      case Intents.TRANSFER_ERC721:
        return new Erc721TransferDecoder(input)
      case Intents.TRANSFER_ERC1155:
        return new ERC1155TransferDecoder(input)
      case Intents.APPROVE_TOKEN_ALLOWANCE:
        return new ApproveTokenAllowanceDecoder(input)
      case Intents.USER_OPERATION:
        return new UserOperationDecoder(input)
      case Intents.CALL_CONTRACT:
      default:
        return new CallContractDecoder(input)
    }
  }

  #findTransactionStrategy(input: TransactionInput): DecoderStrategy {
    const { txRequest, contractRegistry } = input
    const { data, to } = txRequest
    const methodId = getMethodId(data)
    const category = getCategory(methodId, to)

    switch (category) {
      case TransactionCategory.NATIVE_TRANSFER: {
        const validatedTxRequest = validateNativeTransferInput(txRequest)
        return new NativeTransferDecoder(validatedTxRequest)
      }
      case TransactionCategory.CONTRACT_INTERACTION: {
        const validatedTxRequest = validateContractInteractionInput(txRequest, methodId)
        const intent = getTransactionIntentType({
          methodId,
          txRequest: validatedTxRequest,
          contractRegistry
        })
        return this.#findContractCallStrategy(validatedTxRequest, intent)
      }
      case TransactionCategory.CONTRACT_CREATION: {
        const validatedTxRequest = validateContractDeploymentInput(txRequest)
        return new DeployContractDecoder(validatedTxRequest, contractRegistry)
      }
    }
  }

  #wrapTransactionManagementIntents(intent: Intent, input: TransactionInput): Intent {
    const { txRequest, transactionRegistry } = input
    if (!transactionRegistry || !txRequest.nonce || intent.type === Intents.CANCEL_TRANSACTION) return intent
    const trxStatus = transactionLookup(txRequest, transactionRegistry)
    if (trxStatus === TransactionStatus.PENDING) {
      return {
        type: Intents.RETRY_TRANSACTION
      }
    }
    throw new TransactionRequestIntentError({
      message: 'Transaction already executed',
      status: 400,
      context: {
        txRequest,
        originalTrxStatus: trxStatus
      }
    })
  }

  decodeTypedData(input: TypedDataInput): TypedDataIntent {
    const { typedData } = input
    const { primaryType } = typedData
    switch (primaryType) {
      default:
        return decodeTypedData(typedData)
    }
  }

  public decode(input: DecodeInput): Intent {
    switch (input.type) {
      case InputType.TRANSACTION_REQUEST: {
        const strategy = this.#findTransactionStrategy(input)
        const decoded = strategy.decode()
        return this.#wrapTransactionManagementIntents(decoded, input)
      }
      case InputType.TYPED_DATA: {
        return this.decodeTypedData(input)
      }
      default:
        throw new Error('Invalid input type')
    }
  }

  public safeDecode(input: DecodeInput): SafeDecodeOutput {
    try {
      const intent = this.decode(input)
      return {
        success: true,
        intent
      }
    } catch (error) {
      if (error instanceof TransactionRequestIntentError) {
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
}
