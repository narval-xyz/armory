import {
  generateApproval,
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature
} from '@app/orchestration/__test__/fixture/authorization-request.fixture'
import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  SignTransaction
} from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  AuthzApplicationClient,
  EvaluationResponse
} from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { TransferFeedService } from '@app/orchestration/transfer-feed/core/service/transfer-feed.service'
import { Action, Decision, Intents } from '@narval/authz-shared'
import { TransferNative } from '@narval/transaction-request-intent'
import { HttpService } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { Caip10, Caip19 } from 'packages/transaction-request-intent/src/lib/caip'

describe(AuthorizationRequestService.name, () => {
  let module: TestingModule
  let authzRequestRepositoryMock: AuthorizationRequestRepository
  let authzRequestProcessingProducerMock: AuthorizationRequestProcessingProducer
  let httpServiceMock: HttpService
  let transferFeedServiceMock: TransferFeedService
  let authzApplicationClientMock: AuthzApplicationClient
  let service: AuthorizationRequestService

  const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
    request: generateSignTransactionRequest()
  })

  beforeEach(async () => {
    authzRequestRepositoryMock = mock<AuthorizationRequestRepository>()
    authzRequestProcessingProducerMock = mock<AuthorizationRequestProcessingProducer>()
    httpServiceMock = mock<HttpService>()
    transferFeedServiceMock = mock<TransferFeedService>()
    authzApplicationClientMock = mock<AuthzApplicationClient>()

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
          provide: HttpService,
          useValue: httpServiceMock
        },
        {
          provide: TransferFeedService,
          useValue: transferFeedServiceMock
        },
        {
          provide: AuthzApplicationClient,
          useValue: authzApplicationClientMock
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

    it('creates a new approval and evaluates the authorization request', async () => {
      jest.spyOn(authzRequestRepositoryMock, 'update').mockResolvedValue(updatedAuthzRequest)
      jest.spyOn(service, 'evaluate').mockResolvedValue(updatedAuthzRequest)

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
      // TODO (@wcalderipe, 25/01/24): Revisit the types of
      // @narval/transaction-request-intent with @pierre and start using a
      // shared library.
      transactionRequestIntent: {
        type: Intents.TRANSFER_NATIVE,
        amount: '1000000000000000000',
        to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4' as Caip10,
        from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b' as Caip10,
        token: 'eip155:137/slip44/966' as Caip19
      }
    }

    beforeEach(() => {
      jest.spyOn(authzApplicationClientMock, 'evaluation').mockResolvedValue(evaluationResponse)
      jest.spyOn(authzRequestRepositoryMock, 'update').mockResolvedValue(authzRequest)
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
