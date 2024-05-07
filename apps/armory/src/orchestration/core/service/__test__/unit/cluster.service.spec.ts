import { Decision, EvaluationResponse, Feed, Prices } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
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
import { PolicyEngineClient } from '../../../../http/client/policy-engine.client'

describe(ClusterService.name, () => {
  const jwt =
    'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ.eyJyZXF1ZXN0SGFzaCI6IjYwOGFiZTkwOGNmZmVhYjFmYzMzZWRkZTZiNDQ1ODZmOWRhY2JjOWM2ZmU2ZjBhMTNmYTMwNzIzNzI5MGNlNWEiLCJzdWIiOiJ0ZXN0LXJvb3QtdXNlci11aWQiLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6IiwiY25mIjp7Imt0eSI6IkVDIiwiY3J2Ijoic2VjcDI1NmsxIiwiYWxnIjoiRVMyNTZLIiwidXNlIjoic2lnIiwia2lkIjoiMHgwMDBjMGQxOTEzMDhBMzM2MzU2QkVlMzgxM0NDMTdGNjg2ODk3MkM0IiwieCI6IjA0YTlmM2JjZjY1MDUwNTk1OTdmNmYyN2FkOGMwZjAzYTNiZDdhMTc2MzUyMGIwYmZlYzIwNDQ4OGI4ZTU4NDAiLCJ5IjoiN2VlOTI4NDVhYjFjMzVhNzg0YjA1ZmRmYTU2NzcxNWM1M2JiMmYyOTk0OWIyNzcxNGUzYzE3NjBlMzcwOTAwOWE2In19.gFDywYsxY2-uT6H6hyxk51CtJhAZpI8WtcvoXHltiWsoBVOot1zMo3nHAhkWlYRmD3RuLtmOYzi6TwTUM8mFyBs'

  let service: ClusterService
  let authzApplicationClientMock: MockProxy<PolicyEngineClient>

  beforeEach(async () => {
    authzApplicationClientMock = mock<PolicyEngineClient>()

    const module = await Test.createTestingModule({
      providers: [
        ClusterService,
        {
          provide: PolicyEngineClient,
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
      sig: jwt,
      data: generatePrices()
    }

    const input = {
      clientId: authzRequest.clientId,
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
      clientId: authzRequest.id,
      size: 2,
      nodes: [nodeOne, nodeTwo]
    }

    const generateEvaluationResponse = async (
      account: PrivateKeyAccount,
      authzRequest: AuthorizationRequest,
      partial?: Partial<EvaluationResponse>
    ): Promise<EvaluationResponse> => {
      const requestHash = hash(authzRequest.request)
      const signature = await nodeAccount.signMessage({ message: requestHash })

      return {
        decision: Decision.PERMIT,
        request: authzRequest.request,
        approvals: {
          required: [],
          satisfied: [],
          missing: []
        },
        accessToken: {
          value: signature
        },
        ...partial
      }
    }

    beforeEach(async () => {
      jest.spyOn(service, 'getByclientId').mockResolvedValue(cluster)

      const evaluationResponse = await generateEvaluationResponse(nodeAccount, authzRequest)

      authzApplicationClientMock.evaluation.mockResolvedValue(evaluationResponse)
    })

    it('throws when client cluster is not found', async () => {
      jest.spyOn(service, 'getByclientId').mockResolvedValue(null)

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
        message: hash({ notTheOriginalRequest: true })
      })

      authzApplicationClientMock.evaluation.mockResolvedValue({
        ...permit,
        accessToken: { value: signature }
      })

      await expect(service.evaluation(input)).rejects.toThrow(InvalidAttestationSignatureException)
    })
  })
})
