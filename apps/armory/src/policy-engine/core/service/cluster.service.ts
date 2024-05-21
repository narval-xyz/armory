import { Decision, EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { PublicKey, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { isEmpty } from 'lodash'
import { zip } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import { ClusterNotFoundException } from '../../core/exception/cluster-not-found.exception'
import { UnreachableClusterException } from '../../core/exception/unreachable-cluster.exception'
import { PolicyEngineClient } from '../../http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from '../../persistence/repository/policy-engine-node.repository'
import { ConsensusAgreementNotReachException } from '../exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../exception/invalid-attestation-signature.exception'
import { PolicyEngineException } from '../exception/policy-engine.exception'
import { CreatePolicyEngineCluster, PolicyEngineNode } from '../type/cluster.type'

@Injectable()
export class ClusterService {
  private logger = new Logger(ClusterService.name)

  constructor(
    private policyEngineClient: PolicyEngineClient,
    private policyEngineNodeRepository: PolicyEngineNodeRepository
  ) {}

  async create(input: CreatePolicyEngineCluster): Promise<PolicyEngineNode[]> {
    const data = {
      clientId: input.clientId,
      entityDataStore: input.entityDataStore,
      policyDataStore: input.policyDataStore
    }

    // TODO: (@wcalderipe, 15/05/24): Add retry on failure.
    const responses = await Promise.all(input.nodes.map((host) => this.policyEngineClient.createClient({ host, data })))

    const nodes: PolicyEngineNode[] = zip(input.nodes, responses)
      .map(([node, client]) => {
        if (node && client) {
          return {
            id: uuid(),
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            publicKey: client.signer.publicKey,
            url: node
          } satisfies PolicyEngineNode
        }
      })
      .filter((engine): engine is PolicyEngineNode => engine !== undefined)

    await this.policyEngineNodeRepository.bulkCreate(nodes)

    return nodes
  }

  async findNodesByClientId(clientId: string): Promise<PolicyEngineNode[]> {
    return this.policyEngineNodeRepository.findByClientId(clientId)
  }

  async evaluate(clientId: string, evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const nodes = await this.findNodesByClientId(clientId)

    if (isEmpty(nodes)) {
      throw new ClusterNotFoundException(clientId)
    }

    const hosts = nodes.map((node) => node.url)

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
        await this.verifyAttestations(nodes, responses)
      }

      // TODO (@wcalderipe, 06/02/25): The final step of the response depends on
      // the cluster's signing method. Right now, all responses are the same, so
      // we can return any of them. But if we use MPC, we need to finalize the
      // cluster signatures and verify the resulted signature before we can
      // return a final decision.
      return responses[0]
    }

    throw new UnreachableClusterException(clientId, nodes)
  }

  private async verifyAttestations(nodes: PolicyEngineNode[], evaluations: EvaluationResponse[]) {
    for (const [node, evaluation] of zip(nodes, evaluations)) {
      if (evaluation?.accessToken?.value && node) {
        await this.verifyAttestation(evaluation.accessToken.value, node.publicKey)
      } else {
        throw new PolicyEngineException({
          message: 'Cannot verify attestation signature without a token',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          context: { nodeId: node?.id, evaluation }
        })
      }
    }
  }

  private async verifyAttestation(token: string, publicKey: PublicKey) {
    try {
      await verifyJwt(token, publicKey)
    } catch (error) {
      throw new InvalidAttestationSignatureException(token, publicKey, error)
    }
  }
}
