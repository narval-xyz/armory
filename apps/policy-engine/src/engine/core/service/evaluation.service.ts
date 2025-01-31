import { TraceService } from '@narval/nestjs-shared'
import { Action, Decision, EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { Payload, SigningAlg, hash, nowSeconds, signJwt } from '@narval/signature'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { OpenPolicyAgentEngineFactory } from '../factory/open-policy-agent-engine.factory'
import { buildTransactionRequestHashWildcard } from '../util/wildcard-transaction-fields.util'
import { ClientService } from './client.service'
import { SigningService } from './signing.service.interface'

export async function buildPermitTokenPayload(clientId: string, evaluation: EvaluationResponse): Promise<Payload> {
  if (evaluation.decision !== Decision.PERMIT) {
    throw new ApplicationException({
      message: 'Decision is not PERMIT',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId }
    })
  }

  if (!evaluation.principal) {
    throw new ApplicationException({
      message: 'Principal is missing',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId }
    })
  }

  if (!evaluation.request) {
    throw new ApplicationException({
      message: 'Request is missing',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId }
    })
  }

  const { audience, issuer } = evaluation.metadata || {}
  const iat = evaluation.metadata?.issuedAt || nowSeconds()
  const exp = evaluation.metadata?.expiresIn ? evaluation.metadata.expiresIn + iat : null
  const hashWildcard = buildTransactionRequestHashWildcard(evaluation.request)

  const payload: Payload = {
    // jti: TODO
    iat,
    hashWildcard,
    /**
     * Confirmation (cnf) claim handling for token binding:
     *
     * Two scenarios are supported:
     * 1. Standard flow: Uses principal's key as the confirmation claim
     * 2. Delegation flow: Uses a provided confirmation key for token binding
     *
     * The delegation flow enables secure token delegation where:
     * - A client generates a key pair
     * - Passes the public key (metadata.confirmation) to the server
     * - Server issues a token bound to this specific key with the auth server
     * - Only the holder of the corresponding private key can use the token
     *   with the resource server
     *
     * The cnf claim is used in the JWSD header to cryptographically bind the
     * token to a specific key.
     */
    cnf: evaluation.metadata?.confirmation?.key.jwk || evaluation.principal.key,
    sub: evaluation.principal.userId,
    ...(exp && { exp }),
    ...(audience && { aud: audience }),
    ...(issuer && { iss: issuer })
  }

  // Action-specific payload claims
  if (evaluation.request.action === Action.GRANT_PERMISSION) {
    payload.access = [
      {
        resource: evaluation.request.resourceId,
        permissions: evaluation.request.permissions
      }
    ]
  }

  // Everything that is not GRANT_PERMISSION currently requires a requestHash
  // in the future it's likely more actions will also not needed it.
  if (evaluation.request.action !== Action.GRANT_PERMISSION) {
    payload.requestHash = hash(evaluation.request)
  }

  return payload
}

@Injectable()
export class EvaluationService {
  constructor(
    private readonly clientService: ClientService,
    private readonly openPolicyAgentEngineFactory: OpenPolicyAgentEngineFactory,
    @Inject(TraceService) private readonly traceService: TraceService,
    @Inject('SigningService') private readonly signingService: SigningService
  ) {}

  async evaluate(clientId: string, evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new ApplicationException({
        message: 'Client not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { clientId }
      })
    }

    if (!client.signer?.publicKey) {
      throw new ApplicationException({
        message: 'Client signer is not configured',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { clientId }
      })
    }

    const fetchDataSpan = this.traceService.startSpan(`${EvaluationService.name}.evaluate.fetchData`)
    const [entityStore, policyStore] = await Promise.all([
      this.clientService.findEntityStore(clientId),
      this.clientService.findPolicyStore(clientId)
    ])
    fetchDataSpan.end()

    if (!entityStore) {
      throw new ApplicationException({
        message: 'Missing client entity store',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { clientId }
      })
    }

    if (!policyStore) {
      throw new ApplicationException({
        message: 'Missing client entity store',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { clientId }
      })
    }

    // WARN: Loading a new engine is an IO bounded process due to the Rego
    // transpilation and WASM build.
    const engine = await this.openPolicyAgentEngineFactory.create(entityStore.data, policyStore.data)

    const engineEvaluationSpan = this.traceService.startSpan(`${EvaluationService.name}.evaluate.engineEvaluation`)
    const evaluationResponse = await engine.evaluate(evaluation)
    engineEvaluationSpan.end()

    if (evaluationResponse.decision === Decision.PERMIT) {
      const buildAccessTokenSpan = this.traceService.startSpan(`${EvaluationService.name}.evaluate.buildAccessToken`)

      const jwtPayload = await buildPermitTokenPayload(clientId, evaluationResponse)

      const jwt = await signJwt(
        jwtPayload,
        client.signer.publicKey,
        { alg: SigningAlg.EIP191 },
        this.signingService.buildSignerEip191(client.signer, evaluation.sessionId)
      )

      buildAccessTokenSpan.end()

      // Add the access token into the response
      evaluationResponse.accessToken = { value: jwt }
    }

    return evaluationResponse
  }
}
