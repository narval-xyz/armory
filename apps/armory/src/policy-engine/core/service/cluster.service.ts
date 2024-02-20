import { Decision, EvaluationRequest, EvaluationResponse, hashRequest } from '@narval/authz-shared'
import { Injectable, Logger } from '@nestjs/common'
import { zip } from 'lodash/fp'
import { ClusterNotFoundException } from '../../core/exception/cluster-not-found.exception'
import { InvalidAttestationSignatureException } from '../../core/exception/invalid-attestation-signature.exception'
import { UnreachableClusterException } from '../../core/exception/unreachable-cluster.exception'
import { Cluster, Node } from '../../core/type/clustering.type'
import { AuthzApplicationClient } from '../../http/client/authz-application.client'
import { ConsensusAgreementNotReachException } from '../exception/consensus-agreement-not-reach.exception'
// eslint-disable-next-line no-restricted-imports
import { getAddress, isAddressEqual, recoverMessageAddress } from 'viem'

@Injectable()
export class ClusterService {
  private logger = new Logger(ClusterService.name)

  constructor(private authzApplicationClient: AuthzApplicationClient) {}

  async getByOrgId(orgId: string): Promise<Cluster | null> {
    const clusterId = '3e2710cf-dab2-4c0f-8d50-b3b9db4d1b8b'
    // Derived from the hard coded ENGINE_PRIVATE_KEY variable at the
    // AppService in the @app/authz.
    const policyEngineDevPubKey = '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'

    return {
      id: clusterId,
      orgId,
      size: 2,
      nodes: [
        {
          id: '997341e1-50ac-4616-9eb3-25b57a3d7339',
          clusterId,
          host: 'localhost',
          port: 3010,
          pubKey: policyEngineDevPubKey
        },
        {
          id: '7b7b554d-8de0-4419-bac2-ee586fab063c',
          clusterId,
          host: 'localhost',
          port: 3010,
          pubKey: policyEngineDevPubKey
        }
      ]
    }
  }

  async evaluation(input: { orgId: string; data: EvaluationRequest }): Promise<EvaluationResponse> {
    const cluster = await this.getByOrgId(input.orgId)

    if (!cluster) {
      throw new ClusterNotFoundException(input.orgId)
    }

    const hosts = cluster.nodes.map((node) => ClusterService.getNodeHost(node))

    this.logger.log('Sending evaluation request to cluster', {
      clusterId: cluster.id,
      clusterSize: cluster.size,
      nodes: cluster.nodes.map((node) => ({
        id: node.id,
        host: ClusterService.getNodeHost(node)
      }))
    })

    const responses = await Promise.all(
      hosts.map((host) =>
        this.authzApplicationClient.evaluation({
          host,
          data: input.data
        })
      )
    )

    if (responses.length) {
      const decision = responses[0].decision

      if (!responses.every((response) => response.decision === decision)) {
        throw new ConsensusAgreementNotReachException(responses, cluster.nodes)
      }

      const evaluations = this.combineNodeResponse(cluster.nodes, responses)

      if (decision === Decision.PERMIT) {
        const recoveredPubKeys = await Promise.all(evaluations.map(({ response }) => this.recoverPubKey(response)))

        this.verifyAttestationSignatures(cluster.nodes, recoveredPubKeys)
      }

      // TODO (@wcalderipe, 06/02/25): The final step of the response depends on
      // the cluster's signing method. Right now, all responses are the same, so
      // we can return any of them. But if we use MPC, we need to finalize the
      // cluster signatures and verify the resulted signature before we can
      // return a final decision.
      return responses[0]
    }

    throw new UnreachableClusterException(cluster)
  }

  static getNodeHost({ host, port }: Node): string {
    return `http://${host}:${port}`
  }

  private combineNodeResponse(
    nodes: Node[],
    responses: EvaluationResponse[]
  ): { node: Node; response: EvaluationResponse }[] {
    return zip(nodes, responses).reduce(
      (acc, [node, response]) => {
        if (node && response) {
          return [...acc, { node, response }]
        }

        return acc
      },
      [] as { node: Node; response: EvaluationResponse }[]
    )
  }

  private async recoverPubKey(response: EvaluationResponse) {
    const hash = hashRequest(response.request) as `0x${string}`

    return recoverMessageAddress({
      message: hash,
      signature: response.attestation?.sig as `0x${string}`
    })
  }

  private verifyAttestationSignatures(nodes: Node[], recoveredPubKeys: string[]) {
    zip(nodes, recoveredPubKeys).forEach(([node, recoveredPubKey]) => {
      if (node && recoveredPubKey && !isAddressEqual(getAddress(node.pubKey), getAddress(recoveredPubKey))) {
        throw new InvalidAttestationSignatureException(node.pubKey, recoveredPubKey)
      }
    })
  }
}
