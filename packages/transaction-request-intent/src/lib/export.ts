import { decodeTransaction } from './decoders'
import { InputType } from './domain'
import { TransactionRequestIntentError } from './error'
import { Intent } from './intent.types'
import { DecodeInput, SafeIntent } from './types'

export const decode = (input: DecodeInput): Intent => {
  switch (input.type) {
    // case InputType.MESSAGE:
    //   return decodeMessage(input)
    // case InputType.RAW:
    //   return decodeRaw(input)
    // case InputType.TYPED_DATA:
    //   return decodeTypedData(input)
    case InputType.TRANSACTION_REQUEST:
      return decodeTransaction(input)
    default:
      throw new TransactionRequestIntentError({
        message: 'Unknown input type',
        status: 400,
        context: {
          input
        }
      })
  }
}

export const safeDecode = (input: DecodeInput): SafeIntent => {
  try {
    const intent = decode(input)
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
