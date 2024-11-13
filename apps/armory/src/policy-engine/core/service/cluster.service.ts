import { ConfigService } from '@narval/config-module'
import { LoggerService, MetricService, OTEL_ATTR_CLIENT_ID, TraceService } from '@narval/nestjs-shared'
import { Decision, EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { PublicKey, verifyJwt } from '@narval/signature'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { isEmpty } from 'lodash'
import { zip } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import { Config } from '../../../armory.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { isDefined } from '../../../shared/util/array.util'
import { ClusterNotFoundException } from '../../core/exception/cluster-not-found.exception'
import { UnreachableClusterException } from '../../core/exception/unreachable-cluster.exception'
import { PolicyEngineClient } from '../../http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from '../../persistence/repository/policy-engine-node.repository'
import { ConsensusAgreementNotReachException } from '../exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../exception/invalid-attestation-signature.exception'
import { PolicyEngineException } from '../exception/policy-engine.exception'
import { CreatePolicyEngineCluster, PolicyEngineNode } from '../type/cluster.type'
import { FinalizeEcdsaJwtSignature, loadFinalizeEcdsaJwtSignature } from '../util/armory-mpc-module.util'

@Injectable()
export class ClusterService {
  // Keeps a version of the finalizeEcdsaJwtSignature function from
  // @narval-xyz/armory-mpc-module in memory to prevent lazy loading it on
  // every call.
  // TODO: (@wcalderipe, 04/05/24) Investigate if it's possible to use NestJS'
  // lazy modules.
  // See https://docs.nestjs.com/fundamentals/lazy-loading-modules
  private finalizeEcdsaJwtSignature?: FinalizeEcdsaJwtSignature

  private syncCounter: Counter

  constructor(
    private policyEngineClient: PolicyEngineClient,
    private policyEngineNodeRepository: PolicyEngineNodeRepository,
    private configService: ConfigService<Config>,
    private logger: LoggerService,
    @Inject(TraceService) private traceService: TraceService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    this.syncCounter = this.metricService.createCounter('cluster_sync_count')
  }

  async create(input: CreatePolicyEngineCluster): Promise<PolicyEngineNode[]> {
    const data = {
      clientId: input.clientId,
      entityDataStore: input.entityDataStore,
      policyDataStore: input.policyDataStore,
      allowSelfSignedData: input.allowSelfSignedData
    }

    // TODO: (@wcalderipe, 15/05/24): Add retry on failure.
    const responses = await Promise.all(
      input.nodes.map((url) =>
        this.policyEngineClient.createClient({
          data,
          host: url,
          adminApiKey: this.getNodeConfigByUrl(url).adminApiKey
        })
      )
    )

    const nodes: PolicyEngineNode[] = zip(input.nodes, responses)
      .map(([node, client]) => {
        if (node && client) {
          return {
            id: uuid(),
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            publicKey: client.signer.publicKey,
            url: node
          }
        }

        return undefined
      })
      .filter((engine): engine is PolicyEngineNode => engine !== undefined)

    await this.policyEngineNodeRepository.bulkCreate(nodes)

    return nodes
  }

  private getNodeConfigByUrl(url: string): { url: string; adminApiKey: string } {
    const node = this.configService.get('policyEngine.nodes').find((node) => node.url === url)

    if (node && node.adminApiKey) {
      return {
        url: node.url,
        adminApiKey: node.adminApiKey
      }
    }

    throw new ApplicationException({
      message: 'Policy engine node configuration not found',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { url }
    })
  }

  async findNodesByClientId(clientId: string): Promise<PolicyEngineNode[]> {
    return this.policyEngineNodeRepository.findByClientId(clientId)
  }

  async evaluate(clientId: string, evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const nodes = await this.findNodesByClientId(clientId)

    if (isEmpty(nodes)) {
      throw new ClusterNotFoundException(clientId)
    }
    const isMpc = nodes.length > 1

    this.logger.log('Sending evaluation request to cluster', {
      clientId,
      nodes: nodes.map(({ id, url }) => ({ id, url }))
    })

    const responses = await Promise.all(
      nodes.map((node) =>
        this.policyEngineClient.evaluate({
          host: node.url,
          data: evaluation,
          clientId: node.clientId,
          clientSecret: node.clientSecret
        })
      )
    )

    if (responses.length) {
      const decision = responses[0].decision

      if (!responses.every((response) => response.decision === decision)) {
        throw new ConsensusAgreementNotReachException(responses, nodes)
      }

      if (decision === Decision.PERMIT) {
        // If MPC, we have multiple partialSig responses to combine.
        // If they don't have exactly the same decision & accessToken, signature can't be finalized
        // and it will throw.
        const finalResponse = isMpc ? await this.finalizeSignature(responses) : responses[0]

        this.logger.log('Got final response', {
          response: finalResponse,
          isMpc
        })

        await this.verifyAttestation(nodes[0].publicKey, finalResponse.accessToken?.value)

        return finalResponse
      }

      // If it's not a PERMIT, we don't care about all the responses, just the first one.
      // We already validated that the nodes all agreed on the response.
      return responses[0]
    }

    throw new UnreachableClusterException(clientId, nodes)
  }

  private async finalizeSignature(evaluations: EvaluationResponse[]): Promise<EvaluationResponse> {
    if (!this.finalizeEcdsaJwtSignature) {
      this.logger.log('Load finalizeEcdsaJwtSignature function')

      const finalizeEcdsaJwtSignature = loadFinalizeEcdsaJwtSignature()

      if (finalizeEcdsaJwtSignature) {
        this.finalizeEcdsaJwtSignature = finalizeEcdsaJwtSignature

        this.logger.log('Loaded finalizeEcdsaJwtSignature function', {
          finalizeEcdsaJwtSignature: this.finalizeEcdsaJwtSignature
        })
      }

      throw new ApplicationException({
        message: 'The function finalizeEcdsaJwtSignature from @narval-xyz/armory-mpc-module is undefined',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

    try {
      // If MPC, wehave multiple partialSig responses to combine. If they don't
      // have exactly the same decision & accessToken, signature can't be
      // finalized and it will throw.
      const jwts = evaluations.map(({ accessToken }) => accessToken?.value).filter(isDefined)

      if (jwts.length) {
        const finalizedJwt = await this.finalizeEcdsaJwtSignature(jwts)

        return {
          ...evaluations[0],
          accessToken: { value: finalizedJwt }
        }
      }

      throw new ApplicationException({
        message: 'Missing JWTs to finalize',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { jwts }
      })
    } catch (error) {
      throw new ApplicationException({
        message: 'Fail to finalize ECDSA JWT signature',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        origin: error
      })
    }
  }

  private async verifyAttestation(publicKey: PublicKey, token?: string) {
    if (!token) {
      throw new PolicyEngineException({
        message: 'Cannot verify attestation signature without a token',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    try {
      await verifyJwt(token, publicKey)
    } catch (error) {
      throw new InvalidAttestationSignatureException(token, publicKey, error)
    }
  }

  async sync(clientId: string) {
    this.syncCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const span = this.traceService.startSpan(`${ClusterService.name}.sync`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: clientId }
    })

    const nodes = await this.findNodesByClientId(clientId)

    if (isEmpty(nodes)) {
      throw new ClusterNotFoundException(clientId)
    }

    const responses: { success: boolean }[] = await Promise.all(
      nodes.map((node) =>
        this.policyEngineClient.syncClient({
          host: node.url,
          clientId: node.clientId,
          clientSecret: node.clientSecret
        })
      )
    )

    span.end()

    if (responses.length && responses.every((response) => response.success)) {
      return true
    }

    if (responses.some((response) => response.success === false)) {
      return false
    }

    throw new UnreachableClusterException(clientId, nodes)
  }
}
