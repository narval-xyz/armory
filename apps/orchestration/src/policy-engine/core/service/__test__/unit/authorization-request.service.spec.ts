import {
  generateApproval,
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature,
  generateTransactionRequest
} from '@app/orchestration/__test__/fixture/authorization-request.fixture'
import { generateTransferFeed } from '@app/orchestration/__test__/fixture/transfer-feed.fixture'
import { FIAT_ID_USD, POLYGON } from '@app/orchestration/orchestration.constant'
import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  SignTransaction
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthzApplicationClient } from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { ChainId } from '@app/orchestration/shared/core/lib/chains.lib'
import { Transfer } from '@app/orchestration/shared/core/type/transfer-feed.type'
import { TransferTrackingService } from '@app/orchestration/transfer-tracking/core/service/transfer-tracking.service'
import { Action, Decision, EvaluationResponse, getAccountId } from '@narval/authz-shared'
import { Intents, TransferNative } from '@narval/transaction-request-intent'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { times } from 'lodash/fp'

describe(AuthorizationRequestService.name, () => {
  let module: TestingModule
  let authzRequestRepositoryMock: MockProxy<AuthorizationRequestRepository>
  let authzRequestProcessingProducerMock: MockProxy<AuthorizationRequestProcessingProducer>
  let transferFeedServiceMock: MockProxy<TransferTrackingService>
  let authzApplicationClientMock: MockProxy<AuthzApplicationClient>
  let priceServiceMock: MockProxy<PriceService>
  let service: AuthorizationRequestService

  const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
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
    authzApplicationClientMock = mock<AuthzApplicationClient>()
    priceServiceMock = mock<PriceService>()

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
          provide: AuthzApplicationClient,
          useValue: authzApplicationClientMock
        },
        {
          provide: PriceService,
          useValue: priceServiceMock
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
        to: getAccountId('eip155:137/0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4'),
        from: getAccountId('eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b'),
        token: POLYGON.coin.id
      }
    }

    const transfers: Transfer[] = times(() => generateTransferFeed({ orgId: authzRequest.orgId }), 2)

    beforeEach(() => {
      authzApplicationClientMock.evaluation.mockResolvedValue(evaluationResponse)
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

      expect(authzApplicationClientMock.evaluation).toHaveBeenCalledWith({
        host: 'http://localhost:3010',
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

    it('gets transfer asset prices', async () => {
      await service.evaluate(authzRequest)

      expect(priceServiceMock.getPrices).toHaveBeenNthCalledWith(2, {
        from: [POLYGON.coin.id],
        to: [FIAT_ID_USD]
      })
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
        initiatedBy: authzRequest.authentication.pubKey,
        rates: {
          'fiat:usd': 0.99
        },
        createdAt: expect.any(Date)
      })
    })
  })
})
