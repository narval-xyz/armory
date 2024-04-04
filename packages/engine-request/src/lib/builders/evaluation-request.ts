import { EvaluationRequest, Feed, JwtString, Prices, Request } from '@narval/policy-engine-shared'
import { Jwk, Payload, SignConfig, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import { Endpoints, NarvalSdkConfig } from '../domain'

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
    request: Request,
    opts: {
      signConfig: SignConfig
      jwk: Jwk
      clientId: string
    }
  ): Promise<EvaluationRequest> {
    const payload = buildPayloadFromRequest(request, opts.jwk, opts.clientId)
    const { signer, opts: signingOpts } = opts.signConfig
    const authentication = signer
      ? await signJwt(payload, opts.jwk, signingOpts, signer)
      : await signJwt(payload, opts.jwk, signingOpts)
    return {
      authentication,
      request,
      approvals: this.approvals,
      prices: this.prices,
      feeds: this.feeds
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
