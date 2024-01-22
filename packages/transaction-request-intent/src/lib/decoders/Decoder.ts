import {
  ContractCallInput,
  DecodeInput,
  InputType,
  Intents,
  SafeDecodeOutput,
  TransactionCategory,
  TransactionInput
} from '../domain'
import { TransactionRequestIntentError } from '../error'
import { Intent } from '../intent.types'
import { isSupportedMethodId } from '../typeguards'
import { getCategory, getMethodId, getTransactionIntentType } from '../utils'
import { validateContractInteractionInput, validateNativeTransferInput } from '../validators'
import CallContractDecoder from './CallContractDecoder'
import DecoderStrategy from './DecoderStrategy'
import ERC1155TransferDecoder from './Erc1155TransferDecoder'
import Erc20TransferDecoder from './Erc20TransferDecoder'
import Erc721TransferDecoder from './Erc721TransferDecoder'
import NativeTransferDecoder from './NativeTransferDecoder'

export default class Decoder {
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
      case Intents.CALL_CONTRACT:
      default:
        return new CallContractDecoder(input)
    }
  }

  #findTransactionStrategy(input: TransactionInput): DecoderStrategy {
    const { txRequest, contractRegistry, transactionRegistry } = input
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
          contractRegistry,
          transactionRegistry
        })
        return this.#findContractCallStrategy(validatedTxRequest, intent)
      }
      case TransactionCategory.CONTRACT_CREATION: {
        const validatedTxRequest = validateContractInteractionInput(txRequest, methodId)
        return new CallContractDecoder(validatedTxRequest)
      }
    }
  }

  #findStrategy(input: DecodeInput): DecoderStrategy {
    switch (input.type) {
      case InputType.TRANSACTION_REQUEST:
        return this.#findTransactionStrategy(input)
      default:
        throw new Error('Invalid input type')
    }
  }

  public decode(input: DecodeInput): Intent {
    const strategy = this.#findStrategy(input)
    return strategy.decode()
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
