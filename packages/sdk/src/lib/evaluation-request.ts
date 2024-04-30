import { EvaluationRequest, EvaluationResponse, Request } from '@narval/policy-engine-shared'
import { Jwk, Payload, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import { ClientConfig, Endpoints, SignConfig, getConfig } from './domain'

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

export default class PolicyEngine {
  private config: ClientConfig

  constructor(config: ClientConfig) {
    this.config = config
  }

  async sign(request: Request, signConfig: SignConfig): Promise<EvaluationRequest> {
    const config = getConfig(signConfig)

    const payload = buildPayloadFromRequest(request, config.jwk, this.config.id)
    const authentication = await signJwt(payload, config.jwk)

    return {
      authentication,
      request
    }
  }

  async send(request: EvaluationRequest): Promise<EvaluationResponse> {
    const url = `${this.config.url}${Endpoints.engine.evaluations}`
    console.log('url', url)
    const response = await axios.post(`${this.config.url}${Endpoints.engine.evaluations}`, request, {
      headers: {
        'x-client-id': this.config.id,
        'x-client-secret': this.config.secret
      }
    })
    return response.data
  }
}
