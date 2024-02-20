import { Alg, Decision, EvaluationResponse, Feed, Prices, hashRequest } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generatePrices } from '../../../../../__test__/fixture/price.fixture'
import { PriceFeedService } from '../../../../../data-feed/core/service/price-feed.service'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { ClusterNotFoundException } from '../../../../core/exception/cluster-not-found.exception'
import { ConsensusAgreementNotReachException } from '../../../../core/exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../../../../core/exception/invalid-attestation-signature.exception'
import { ClusterService } from '../../../../core/service/cluster.service'
import { Cluster, Node } from '../../../../core/type/clustering.type'
import { AuthorizationRequest } from '../../../../core/type/domain.type'
import { AuthzApplicationClient } from '../../../../http/client/authz-application.client'

describe(ClusterService.name, () => {
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

    it('throws when organization cluster is not found', async () => {
      jest.spyOn(service, 'getByOrgId').mockResolvedValue(null)

      await expect(service.evaluation(input)).rejects.toThrow(ClusterNotFoundException)
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

      await expect(service.evaluation(input)).rejects.toThrow(ConsensusAgreementNotReachException)
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

      await expect(service.evaluation(input)).rejects.toThrow(InvalidAttestationSignatureException)
    })
  })
})
