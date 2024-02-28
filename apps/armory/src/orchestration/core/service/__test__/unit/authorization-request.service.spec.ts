import { Action, Decision, EvaluationResponse, getAccountId } from '@narval/policy-engine-shared'
import { Intents, TransferNative } from '@narval/transaction-request-intent'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { times } from 'lodash/fp'
import {
  generateApproval,
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generateTransfer } from '../../../../../__test__/fixture/transfer-tracking.fixture'
import { FIAT_ID_USD, POLYGON } from '../../../../../armory.constant'
import { FeedService } from '../../../../../data-feed/core/service/feed.service'
import { PriceService } from '../../../../../price/core/service/price.service'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { Transfer } from '../../../../../shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '../../../../../transfer-tracking/core/service/transfer-tracking.service'
import { AuthorizationRequestAlreadyProcessingException } from '../../../../core/exception/authorization-request-already-processing.exception'
import { AuthorizationRequestService } from '../../../../core/service/authorization-request.service'
import { ClusterService } from '../../../../core/service/cluster.service'
import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  SignTransaction
} from '../../../../core/type/domain.type'
import { AuthorizationRequestRepository } from '../../../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '../../../../queue/producer/authorization-request-processing.producer'

describe(AuthorizationRequestService.name, () => {
  let module: TestingModule
  let authzRequestRepositoryMock: MockProxy<AuthorizationRequestRepository>
  let authzRequestProcessingProducerMock: MockProxy<AuthorizationRequestProcessingProducer>
  let transferFeedServiceMock: MockProxy<TransferTrackingService>
  let clusterServiceMock: MockProxy<ClusterService>
  let priceServiceMock: MockProxy<PriceService>
  let feedServiceMock: MockProxy<FeedService>
  let service: AuthorizationRequestService

  const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
    status: AuthorizationRequestStatus.CREATED,
    request: generateSignTransactionRequest({
      transactionRequest: generateTransactionRequest({
        chainId: ChainId.POLYGON
      })
    })
  })

  beforeEach(async () => {
    authzRequestRepositoryMock = mock<AuthorizationRequestRepository>()
    authzRequestProcessingProducerMock = mock<AuthorizationRequestProcessingProducer>()
    transferFeedServiceMock = mock<TransferTrackingService>()
    clusterServiceMock = mock<ClusterService>()
    priceServiceMock = mock<PriceService>()
    feedServiceMock = mock<FeedService>()

    module = await Test.createTestingModule({
      providers: [
        AuthorizationRequestService,
        {
          provide: AuthorizationRequestRepository,
          useValue: authzRequestRepositoryMock
        },
        {
          provide: AuthorizationRequestProcessingProducer,
          useValue: authzRequestProcessingProducerMock
        },
        {
          provide: TransferTrackingService,
          useValue: transferFeedServiceMock
        },
        {
          provide: ClusterService,
          useValue: clusterServiceMock
        },
        {
          provide: PriceService,
          useValue: priceServiceMock
        },
        {
          provide: FeedService,
          useValue: feedServiceMock
        }
      ]
    }).compile()

    service = module.get<AuthorizationRequestService>(AuthorizationRequestService)
  })

  describe('approve', () => {
    const approval: Approval = generateApproval()

    const updatedAuthzRequest: AuthorizationRequest = {
      ...authzRequest,
      approvals: [approval]
    }

    beforeEach(() => {
      // To isolate the approve scenario, prevents the evaluation procedure to
      // run by mocking it.
      jest.spyOn(service, 'evaluate').mockResolvedValue(updatedAuthzRequest)
    })

    it('creates a new approval and evaluates the authorization request', async () => {
      authzRequestRepositoryMock.update.mockResolvedValue(updatedAuthzRequest)

      await service.approve(authzRequest.id, approval)

      expect(authzRequestRepositoryMock.update).toHaveBeenCalledWith({
        id: authzRequest.id,
        approvals: [approval]
      })
      expect(service.evaluate).toHaveBeenCalledWith(updatedAuthzRequest)
    })
  })

  describe('evaluate', () => {
    const evaluationResponse: EvaluationResponse = {
      decision: Decision.PERMIT,
      request: authzRequest.request,
      attestation: generateSignature(),
      transactionRequestIntent: {
        type: Intents.TRANSFER_NATIVE,
        amount: '1000000000000000000',
        to: getAccountId('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4'),
        from: getAccountId('eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b'),
        token: POLYGON.coin.id
      }
    }

    const transfers: Transfer[] = times(() => generateTransfer({ orgId: authzRequest.orgId }), 2)

    beforeEach(() => {
      clusterServiceMock.evaluation.mockResolvedValue(evaluationResponse)
      authzRequestRepositoryMock.update.mockResolvedValue(authzRequest)
      transferFeedServiceMock.findByOrgId.mockResolvedValue(transfers)
      priceServiceMock.getPrices.mockResolvedValue({
        [POLYGON.coin.id]: {
          [FIAT_ID_USD]: 0.99
        }
      })
    })

    it('gets request assets prices', async () => {
      await service.evaluate(authzRequest)

      expect(priceServiceMock.getPrices).toHaveBeenNthCalledWith(1, {
        from: [POLYGON.coin.id],
        to: [FIAT_ID_USD]
      })
    })

    it('calls authz application client', async () => {
      await service.evaluate(authzRequest)

      expect(clusterServiceMock.evaluation).toHaveBeenCalledWith({
        orgId: authzRequest.orgId,
        data: expect.objectContaining({
          authentication: authzRequest.authentication,
          approvals: authzRequest.approvals,
          request: authzRequest.request
        })
      })
    })

    it('updates the authorization request with the evaluation response', async () => {
      await service.evaluate(authzRequest)

      expect(authzRequestRepositoryMock.update).toHaveBeenCalledWith({
        id: authzRequest.id,
        orgId: authzRequest.orgId,
        status: AuthorizationRequestStatus.PERMITTED,
        evaluations: [
          expect.objectContaining({
            id: expect.any(String),
            decision: evaluationResponse.decision,
            signature: evaluationResponse.attestation?.sig,
            createdAt: expect.any(Date)
          })
        ]
      })
    })

    it('gathers data feed', async () => {
      await service.evaluate(authzRequest)

      expect(feedServiceMock.gather).toHaveBeenCalledWith(authzRequest)
    })

    it('tracks approved transfer when signing a transaction', async () => {
      await service.evaluate(authzRequest)

      const intent = evaluationResponse.transactionRequestIntent as TransferNative
      const request = authzRequest.request as SignTransaction

      // Ensure the casts above are right.
      expect(intent.type).toEqual(Intents.TRANSFER_NATIVE)
      expect(request.action).toEqual(Action.SIGN_TRANSACTION)

      expect(transferFeedServiceMock.track).toHaveBeenCalledWith({
        amount: BigInt(intent.amount),
        to: intent.to,
        from: intent.from,
        token: intent.token,
        chainId: request.transactionRequest.chainId,
        orgId: authzRequest.orgId,
        requestId: authzRequest.id,
        initiatedBy: authzRequest.authentication.pubKey,
        rates: {
          'fiat:usd': 0.99
        },
        createdAt: expect.any(Date)
      })
    })

    it('throws AuthorizationRequestAlreadyProcessingException when status is PROCESSING', async () => {
      await expect(
        service.evaluate({
          ...authzRequest,
          status: AuthorizationRequestStatus.PROCESSING
        })
      ).rejects.toThrow(AuthorizationRequestAlreadyProcessingException)
    })
  })
})
