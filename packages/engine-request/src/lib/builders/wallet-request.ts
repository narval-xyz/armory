import {
  Eip712TypedData,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  TransactionRequest
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import { ZodError } from 'zod'
import { WalletAction } from '../domain'
import EvaluationRequestBuilder from './evaluation-request'

export default class WalletRequestBuilder extends EvaluationRequestBuilder {
  action: WalletAction
  resourceId: string
  nonce: string

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
    }
  }

  setNonce(nonce: string) {
    this.nonce = nonce
    return this
  }

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

  build(): SignTransactionAction | ZodError {
    const nonce = this.nonce || v4()
    const request = {
      action: WalletAction.SIGN_TRANSACTION,
      nonce,
      resourceId: this.resourceId,
      transactionRequest: this.transactionRequest
    }
    const res = SignTransactionAction.safeParse(request)
    return res.success ? res.data : res.error
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

  build(): SignRawAction | ZodError {
    const nonce = this.nonce || v4()
    const request = {
      action: WalletAction.SIGN_RAW,
      nonce,
      resourceId: this.resourceId,
      rawMessage: this.rawMessage
    }
    const res = SignRawAction.safeParse(request)
    return res.success ? res.data : res.error
  }
}

class SignMessageBuilder extends WalletRequestBuilder {
  private message: string

  setMessage(message: string) {
    this.message = message
    return this
  }

  build(): SignMessageAction | ZodError {
    const nonce = this.nonce || v4()
    const request = {
      action: WalletAction.SIGN_MESSAGE,
      nonce,
      resourceId: this.resourceId,
      message: this.message
    }
    const res = SignMessageAction.safeParse(request)
    return res.success ? res.data : res.error
  }
}

class SignTypedDataBuilder extends WalletRequestBuilder {
  private typedData: Eip712TypedData

  setTypedData(typedData: Eip712TypedData) {
    this.typedData = typedData
    return this
  }

  build(): SignTypedDataAction | ZodError {
    const nonce = this.nonce || v4()
    const request = {
      action: WalletAction.SIGN_TYPED_DATA,
      nonce,
      resourceId: this.resourceId,
      typedData: this.typedData
    }
    const res = SignTypedDataAction.safeParse(request)
    return res.success ? res.data : res.error
  }
}
