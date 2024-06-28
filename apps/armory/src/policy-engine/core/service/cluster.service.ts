/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @nx/enforce-module-boundaries */
import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Decision, EvaluationRequest, EvaluationResponse, toHex } from '@narval/policy-engine-shared'
import { Hex, PublicKey, base64UrlToHex, eip191Hash, hexToBase64Url, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { hexToBytes } from '@noble/curves/abstract/utils'
import { secp256k1 } from '@noble/curves/secp256k1'
import { isEmpty } from 'lodash'
import { zip } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import { Config } from '../../../armory.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { ClusterNotFoundException } from '../../core/exception/cluster-not-found.exception'
import { UnreachableClusterException } from '../../core/exception/unreachable-cluster.exception'
import { PolicyEngineClient } from '../../http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from '../../persistence/repository/policy-engine-node.repository'
import { ConsensusAgreementNotReachException } from '../exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../exception/invalid-attestation-signature.exception'
import { PolicyEngineException } from '../exception/policy-engine.exception'
import { CreatePolicyEngineCluster, PolicyEngineNode } from '../type/cluster.type'

let TSMClient: any
const tsmsdkv2 = require('@sepior/tsmsdkv2')
try {
  TSMClient = tsmsdkv2.TSMClient
} catch (err) {
  // eslint-disable-next-line no-console
  console.log('@sepior/tsmsdkv2 is not installed')
}

@Injectable()
export class ClusterService {
  constructor(
    private policyEngineClient: PolicyEngineClient,
    private policyEngineNodeRepository: PolicyEngineNodeRepository,
    private configService: ConfigService<Config>,
    private readonly logger: LoggerService
  ) {}

  async create(input: CreatePolicyEngineCluster): Promise<PolicyEngineNode[]> {
    const data = {
      clientId: input.clientId,
      entityDataStore: input.entityDataStore,
      policyDataStore: input.policyDataStore
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

  async finalizeSignature(evaluations: EvaluationResponse[]): Promise<EvaluationResponse> {
    if (!TSMClient) {
      throw new ApplicationException({
        message: 'TSM SDK not installed',
        suggestedHttpStatusCode: 500
      })
    }
    const tsmClient = new TSMClient(null)
    // Each `evaluation` should have a "signed" accessToken, but it's a partial sig.
    // It was generated as if it was a real sig, so it's a base64url encoded value.

    const partialSigs = evaluations.map((e) => {
      const parts = e.accessToken?.value.split('.') || []
      const sig = parts[2] || ''
      const hexSig = base64UrlToHex(sig)
      return hexToBytes(hexSig.slice(2))
    })
    // We'll re-create the message to sign based on the JWT. All the JWTs should be the same except the partial sigs
    // So we can use the first one. If they aren't all the same, the finalizeSignature will fail anywyas,
    // so no need to check equality specifically.
    const jwt = evaluations[0].accessToken?.value
    const parts = jwt?.split('.') || []
    const message = eip191Hash([parts[0], parts[1]].join('.'))
    // NOTE TSM returns a DER signature
    const { signature, recoveryID } = await tsmClient.ECDSA().finalizeSignature(message, partialSigs)
    const sig = secp256k1.Signature.fromDER(signature)

    const hexSignature: Hex = `0x${sig.toCompactHex()}${toHex(27n + BigInt(recoveryID)).slice(2)}`
    const jwtSig = hexToBase64Url(hexSignature)
    const finalJwt = [parts[0], parts[1], jwtSig].join('.')
    return {
      ...evaluations[0],
      accessToken: { value: finalJwt }
    }
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
        this.logger.log('Got final response', finalResponse)

        await this.verifyAttestation(nodes[0].publicKey, finalResponse.accessToken?.value)
        return finalResponse
      }

      // If it's not a PERMIT, we don't care about all the responses, just the first one.
      // We already validated that the nodes all agreed on the response.
      return responses[0]
    }

    throw new UnreachableClusterException(clientId, nodes)
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

    if (responses.length && responses.every((response) => response.success)) {
      return true
    }

    if (responses.some((response) => response.success === false)) {
      return false
    }

    throw new UnreachableClusterException(clientId, nodes)
  }
}
