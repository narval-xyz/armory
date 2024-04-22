import { EvaluationRequest, EvaluationResponse, Request } from '@narval-xyz/policy-engine-domain'
import { Jwk, Payload, SignConfig, hash, signJwt } from '@narval-xyz/signature'
import axios from 'axios'
import { Endpoints, PolicyEngineConfig } from '../domain'

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

export default class PolicyEngine {
  private config: PolicyEngineConfig

  constructor(config: PolicyEngineConfig) {
    this.config = config
  }

  async sign(request: Request, jwk: Jwk, signConfig?: SignConfig): Promise<EvaluationRequest> {
    const payload = buildPayloadFromRequest(request, jwk, this.config.client.id)
    const { signer, opts: signingOpts } = signConfig || { opts: { alg: 'ES256K' } }
    const authentication = signer
      ? await signJwt(payload, jwk, signingOpts, signer)
      : await signJwt(payload, jwk, signingOpts)
    return {
      authentication,
      request
    }
  }

  async send(request: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await axios.post(`${this.config.url}${Endpoints.engine.evaluations}`, request, {
      headers: {
        'x-client-id': this.config.client.id,
        'x-client-secret': this.config.client.secret
      }
    })
    return response.data
  }
}
