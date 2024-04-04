import {
  Eip712TypedData,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  TransactionRequest
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import { BuildResponse, WalletAction } from '../domain'

/**
 * Builder class for creating wallet-related requests, such as signing transactions, raw data, messages, or typed data.
 */
export default class WalletRequestBuilder {
  private action: WalletAction
  private resourceId: string
  private nonce: string

  /**
   * Mandatory. Sets the action to be performed by the request.
   * @param action - The specific wallet action to perform.
   * @returns The builder instance specific to the action for method chaining.
   * @example
   * const request = buildRequest('wallet')
   *  .setAction('signTransaction')
   *  .setTransactionRequest(transactionRequest)
   * @example
   * const request = buildRequest('wallet')
   *  .setAction('signRaw')
   *  .setRawMessage(rawMessage)
   */
  setAction(action: 'signTransaction'): SignTransactionBuilder
  setAction(action: 'signRaw'): SignRawBuilder
  setAction(action: 'signMessage'): SignMessageBuilder
  setAction(action: 'signTypedData'): SignTypedDataBuilder
  setAction(action: WalletAction) {
    switch (action) {
      case WalletAction.SIGN_TRANSACTION:
        return new SignTransactionBuilder()
      case WalletAction.SIGN_RAW:
        return new SignRawBuilder()
      case WalletAction.SIGN_MESSAGE:
        return new SignMessageBuilder()
      case WalletAction.SIGN_TYPED_DATA:
        return new SignTypedDataBuilder()
      default:
        throw new Error(`Invalid action: ${action}`)
    }
  }

  /**
   * Optional. Sets the unique identifier for the transaction nonce.
   * @default v4()
   * @optional
   * @param nonce - The nonce value as a string.
   * @returns The builder instance for method chaining.
   */
  setNonce(nonce: string) {
    this.nonce = nonce
    return this
  }

  protected getNonce() {
    return this.nonce
  }

  protected getResourceId() {
    return this.resourceId
  }

  /**
   * Mandatory. Sets the resource identifier involved in the request, usually the wallet address.
   * @param resourceId - The Ethereum wallet address as a string.
   * @mandatory
   * @returns The builder instance for method chaining.
   */
  setResourceId(resourceId: string) {
    this.resourceId = resourceId
    return this
  }
}

class SignTransactionBuilder extends WalletRequestBuilder {
  private transactionRequest: TransactionRequest

  setTransactionRequest(transactionRequest: TransactionRequest) {
    this.transactionRequest = transactionRequest
    return this
  }

  /**
   * Constructs and returns the final request object based on the previously provided configurations.
   * @returns {BuildResponse<SignTransactionAction>} The final request object if all required configurations are valid, otherwise returns an error object.
   */
  build(): BuildResponse<SignTransactionAction> {
    const nonce = this.getNonce() || v4()
    const request = {
      action: WalletAction.SIGN_TRANSACTION,
      nonce,
      resourceId: this.getResourceId(),
      transactionRequest: this.transactionRequest
    }
    const res = SignTransactionAction.safeParse(request)
    return res.success
      ? {
          success: true,
          request: res.data
        }
      : {
          success: false,
          error: res.error
        }
  }
}

class SignRawBuilder extends WalletRequestBuilder {
  private rawMessage: string
  private alg: string

  setRawMessage(rawMessage: string) {
    this.rawMessage = rawMessage
    return this
  }

  setAlg(alg: string) {
    this.alg = alg
    return this
  }

  /**
   * Constructs and returns the final request object based on the previously provided configurations.
   * @returns {BuildResponse<SignRawAction>} The final request object if all required configurations are valid, otherwise returns an error object.
   */
  build(): BuildResponse<SignRawAction> {
    const nonce = this.getNonce() || v4()
    const request = {
      action: WalletAction.SIGN_RAW,
      nonce,
      resourceId: this.getResourceId(),
      rawMessage: this.rawMessage
    }
    const res = SignRawAction.safeParse(request)
    return res.success
      ? {
          success: true,
          request: res.data
        }
      : {
          success: false,
          error: res.error
        }
  }
}

class SignMessageBuilder extends WalletRequestBuilder {
  private message: string

  setMessage(message: string) {
    this.message = message
    return this
  }

  /**
   * Constructs and returns the final request object based on the previously provided configurations.
   * @returns {BuildResponse<SignMessageAction>} The final request object if all required configurations are valid, otherwise returns an error object.
   */
  build(): BuildResponse<SignMessageAction> {
    const nonce = this.getNonce() || v4()
    const request = {
      action: WalletAction.SIGN_MESSAGE,
      nonce,
      resourceId: this.getResourceId(),
      message: this.message
    }
    const res = SignMessageAction.safeParse(request)
    return res.success
      ? {
          success: true,
          request: res.data
        }
      : {
          success: false,
          error: res.error
        }
  }
}

class SignTypedDataBuilder extends WalletRequestBuilder {
  private typedData: Eip712TypedData

  setTypedData(typedData: Eip712TypedData) {
    this.typedData = typedData
    return this
  }

  /**
   * Constructs and returns the final request object based on the previously provided configurations.
   * @returns {BuildResponse<SignTypedDataAction>} The final request object if all required configurations are valid, otherwise returns an error object.
   */
  build(): BuildResponse<SignTypedDataAction> {
    const nonce = this.getNonce() || v4()
    const request = {
      action: WalletAction.SIGN_TYPED_DATA,
      nonce,
      resourceId: this.getResourceId(),
      typedData: this.typedData
    }
    const res = SignTypedDataAction.safeParse(request)
    return res.success
      ? {
          success: true,
          request: res.data
        }
      : {
          success: false,
          error: res.error
        }
  }
}
