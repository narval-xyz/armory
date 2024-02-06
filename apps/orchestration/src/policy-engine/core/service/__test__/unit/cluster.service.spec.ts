import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature,
  generateTransactionRequest
} from '@app/orchestration/__test__/fixture/authorization-request.fixture'
import { generatePrices } from '@app/orchestration/__test__/fixture/price.fixture'
import { PriceFeedService } from '@app/orchestration/data-feed/core/service/price-feed.service'
import { ClusterNotFoundException } from '@app/orchestration/policy-engine/core/exception/cluster-not-found.exception'
import { EvaluationConsensusException } from '@app/orchestration/policy-engine/core/exception/evaluation-consensus.exception'
import { InvalidAttestationSignatureException } from '@app/orchestration/policy-engine/core/exception/invalid-attestation-signature.exception'
import { ClusterService } from '@app/orchestration/policy-engine/core/service/cluster.service'
import { Cluster, Node } from '@app/orchestration/policy-engine/core/type/clustering.type'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthzApplicationClient } from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { ChainId } from '@app/orchestration/shared/core/lib/chains.lib'
import { Alg, Decision, EvaluationResponse, Feed, Prices, hashRequest } from '@narval/authz-shared'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

describe('', () => {
  let service: ClusterService
  let authzApplicationClientMock: MockProxy<AuthzApplicationClient>

  beforeEach(async () => {
    authzApplicationClientMock = mock<AuthzApplicationClient>()

    const module = await Test.createTestingModule({
      providers: [
        ClusterService,
        {
          provide: AuthzApplicationClient,
          useValue: authzApplicationClientMock
        }
      ]
    }).compile()

    service = module.get<ClusterService>(ClusterService)
  })

  describe('evaluation', () => {
    const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
      request: generateSignTransactionRequest({
        transactionRequest: generateTransactionRequest({
          chainId: ChainId.POLYGON
        })
      })
    })

    const priceFeed: Feed<Prices> = {
      source: PriceFeedService.SOURCE_ID,
      sig: generateSignature(),
      data: generatePrices()
    }

    const input = {
      orgId: authzRequest.orgId,
      data: {
        authentication: authzRequest.authentication,
        approvals: authzRequest.approvals,
        request: authzRequest.request,
        feeds: [priceFeed]
      }
    }

    const clusterId = '2c82dafc-b5e2-444d-85f7-3909b5fecdb1'

    const nodePrivateKey = generatePrivateKey()

    const nodeAccount = privateKeyToAccount(nodePrivateKey)

    const nodeOne: Node = {
      id: '997341e1-50ac-4616-9eb3-25b57a3d7339',
      clusterId,
      host: 'localhost',
      port: 9999,
      pubKey: nodeAccount.address
    }

    const nodeTwo: Node = {
      id: '2df7a786-bac0-46ca-bcf3-487f03436ac7',
      clusterId,
      host: 'localhost',
      port: 9999,
      pubKey: nodeAccount.address
    }

    const cluster: Cluster = {
      id: clusterId,
      orgId: authzRequest.id,
      size: 2,
      nodes: [nodeOne, nodeTwo]
    }

    const generateEvaluationResponse = async (
      account: PrivateKeyAccount,
      authzRequest: AuthorizationRequest,
      partial?: Partial<EvaluationResponse>
    ): Promise<EvaluationResponse> => {
      const hash = hashRequest(authzRequest.request)
      const signature = await nodeAccount.signMessage({ message: hash })

      return {
        decision: Decision.PERMIT,
        request: authzRequest.request,
        approvals: {
          required: [],
          satisfied: [],
          missing: []
        },
        attestation: {
          sig: signature,
          alg: Alg.ES256K,
          pubKey: account.address
        },
        ...partial
      }
    }

    beforeEach(async () => {
      jest.spyOn(service, 'getByOrgId').mockResolvedValue(cluster)

      const evaluationResponse = await generateEvaluationResponse(nodeAccount, authzRequest)

      authzApplicationClientMock.evaluation.mockResolvedValue(evaluationResponse)
    })

    it('throws when organization cluster is not found', () => {
      jest.spyOn(service, 'getByOrgId').mockResolvedValue(null)

      expect(service.evaluation(input)).rejects.toThrow(ClusterNotFoundException)
    })

    it('responds with the first response from the cluster', async () => {
      const response = await service.evaluation(input)

      // Right now, the system uses the first response from the cluster. Since the
      // evaluation response is deterministic, we can recreate it to
      // check if the returned value is correct.
      expect(response).toEqual(await generateEvaluationResponse(nodeAccount, authzRequest))
    })

    it('sends evaluation request to each node', async () => {
      await service.evaluation(input)

      expect(authzApplicationClientMock.evaluation).toHaveBeenNthCalledWith(1, {
        host: `http://${nodeOne.host}:${nodeOne.port}`,
        data: input.data
      })
      expect(authzApplicationClientMock.evaluation).toHaveBeenNthCalledWith(2, {
        host: `http://${nodeTwo.host}:${nodeTwo.port}`,
        data: input.data
      })
    })

    it('throws when the nodes consensus disagree', async () => {
      const permit = await generateEvaluationResponse(nodeAccount, authzRequest, { decision: Decision.PERMIT })
      const forbid = await generateEvaluationResponse(nodeAccount, authzRequest, { decision: Decision.FORBID })

      authzApplicationClientMock.evaluation.mockResolvedValueOnce(permit)
      authzApplicationClientMock.evaluation.mockResolvedValueOnce(forbid)

      expect(service.evaluation(input)).rejects.toThrow(EvaluationConsensusException)
    })

    it('throws when node attestation is invalid', async () => {
      const permit = await generateEvaluationResponse(nodeAccount, authzRequest)
      const signature = await nodeAccount.signMessage({
        message: hashRequest({ notTheOriginalRequest: true })
      })

      authzApplicationClientMock.evaluation.mockResolvedValue({
        ...permit,
        attestation: {
          alg: Alg.ES256K,
          sig: signature,
          pubKey: nodeAccount.address
        }
      })

      expect(service.evaluation(input)).rejects.toThrow(InvalidAttestationSignatureException)
    })
  })
})
