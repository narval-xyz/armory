import { EvaluationRequest, Feed, JwtString, Prices, Request, TransactionRequest } from '@narval/policy-engine-shared'
import { Jwk, Payload, SignConfig, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import { v4 } from 'uuid'
import { Endpoints, NarvalSdkConfig, RequestInput } from '../domain'

export type EvaluationRequestConfig = {
  approvals?: JwtString[]
  prices?: Prices
  feeds?: Feed<unknown>[]
}

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

const buildNonce = (): string => {
  return v4()
}

const getRequestFromInput = (input: RequestInput): Request => {
  const { request } = input

  const nonce = input.nonce || buildNonce()
  switch (request.action) {
    case 'signTransaction':
      const validatedTransactionRequest = TransactionRequest.parse(request.transactionRequest)
      return {
        action: request.action,
        resourceId: input.resourceId,
        transactionRequest: validatedTransactionRequest,
        nonce
      }
    case 'signMessage':
      return {
        action: request.action,
        message: request.message,
        resourceId: input.resourceId,
        nonce
      }
    case 'signTypedData':
      return {
        action: request.action,
        typedData: request.typedData,
        resourceId: input.resourceId,
        nonce
      }
    case 'signRaw':
      return {
        action: request.action,
        rawMessage: request.rawMessage,
        resourceId: input.resourceId,
        nonce
      }
  }
}

export default class EvaluationRequestBuilder {
  private approvals?: JwtString[]
  private prices?: Prices
  private feeds?: Feed<unknown>[]

  constructor(config?: EvaluationRequestConfig) {
    this.approvals = config?.approvals
    this.prices = config?.prices
    this.feeds = config?.feeds
  }

  async sign(
    input: RequestInput,
    signParams: {
      signConfig: SignConfig
      jwk: Jwk
      clientId: string
    }
  ): Promise<EvaluationRequest> {
    const { approvals, prices, feeds } = input
    const request = getRequestFromInput(input)
    const payload = buildPayloadFromRequest(request, signParams.jwk, signParams.clientId)
    const { signer, opts: signingOpts } = signParams.signConfig
    const authentication = signer
      ? await signJwt(payload, signParams.jwk, signingOpts, signer)
      : await signJwt(payload, signParams.jwk, signingOpts)
    return {
      authentication,
      request,
      approvals: approvals || this.approvals,
      prices: prices || this.prices,
      feeds: feeds || this.feeds
    }
  }

  async send(request: EvaluationRequest, config: NarvalSdkConfig): Promise<EvaluationRequest> {
    const response = await axios.post(`${config.engine.url}${Endpoints.engine.evaluations}`, request, {
      headers: {
        'x-client-id': config.client.id,
        'x-client-secret': config.client.secret
      }
    })
    return response.data
  }
}
