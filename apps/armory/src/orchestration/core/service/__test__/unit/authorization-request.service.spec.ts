import {
  LoggerModule,
  LoggerService,
  MetricService,
  NullLoggerService,
  OTEL_ATTR_CLIENT_ID,
  OpenTelemetryModule,
  StatefulMetricService
} from '@narval/nestjs-shared'
import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  Decision,
  EvaluationResponse,
  FIXTURE,
  SignTransaction,
  getChainAccountId
} from '@narval/policy-engine-shared'
import { Intents, TransferNative } from '@narval/transaction-request-intent'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { times } from 'lodash/fp'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generateTransfer } from '../../../../../__test__/fixture/transfer-tracking.fixture'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS, FIAT_ID_USD, POLYGON } from '../../../../../armory.constant'
import { FeedService } from '../../../../../data-feed/core/service/feed.service'
import { AuthorizationRequestApprovalRepository } from '../../../../../orchestration/persistence/repository/authorization-request-approval.repository'
import { ClusterService } from '../../../../../policy-engine/core/service/cluster.service'
import { PriceService } from '../../../../../price/core/service/price.service'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { Transfer } from '../../../../../shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '../../../../../transfer-tracking/core/service/transfer-tracking.service'
import { AuthorizationRequestService } from '../../../../core/service/authorization-request.service'
import { AuthorizationRequestRepository } from '../../../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '../../../../queue/producer/authorization-request-processing.producer'
import { AuthorizationRequestAlreadyProcessingException } from '../../../exception/authorization-request-already-processing.exception'

describe(AuthorizationRequestService.name, () => {
  const jwt =
    'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ.eyJyZXF1ZXN0SGFzaCI6IjYwOGFiZTkwOGNmZmVhYjFmYzMzZWRkZTZiNDQ1ODZmOWRhY2JjOWM2ZmU2ZjBhMTNmYTMwNzIzNzI5MGNlNWEiLCJzdWIiOiJ0ZXN0LXJvb3QtdXNlci11aWQiLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6IiwiY25mIjp7Imt0eSI6IkVDIiwiY3J2Ijoic2VjcDI1NmsxIiwiYWxnIjoiRVMyNTZLIiwidXNlIjoic2lnIiwia2lkIjoiMHgwMDBjMGQxOTEzMDhBMzM2MzU2QkVlMzgxM0NDMTdGNjg2ODk3MkM0IiwieCI6IjA0YTlmM2JjZjY1MDUwNTk1OTdmNmYyN2FkOGMwZjAzYTNiZDdhMTc2MzUyMGIwYmZlYzIwNDQ4OGI4ZTU4NDAiLCJ5IjoiN2VlOTI4NDVhYjFjMzVhNzg0YjA1ZmRmYTU2NzcxNWM1M2JiMmYyOTk0OWIyNzcxNGUzYzE3NjBlMzcwOTAwOWE2In19.gFDywYsxY2-uT6H6hyxk51CtJhAZpI8WtcvoXHltiWsoBVOot1zMo3nHAhkWlYRmD3RuLtmOYzi6TwTUM8mFyBs'

  let module: TestingModule
  let authzRequestRepositoryMock: MockProxy<AuthorizationRequestRepository>
  let authzRequestApprovalRepository: MockProxy<AuthorizationRequestApprovalRepository>
  let authzRequestProcessingProducerMock: MockProxy<AuthorizationRequestProcessingProducer>
  let transferFeedServiceMock: MockProxy<TransferTrackingService>
  let clusterServiceMock: MockProxy<ClusterService>
  let priceServiceMock: MockProxy<PriceService>
  let feedServiceMock: MockProxy<FeedService>
  let statefulMetricService: StatefulMetricService
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
    authzRequestApprovalRepository = mock<AuthorizationRequestApprovalRepository>()
    authzRequestProcessingProducerMock = mock<AuthorizationRequestProcessingProducer>()
    transferFeedServiceMock = mock<TransferTrackingService>()
    clusterServiceMock = mock<ClusterService>()
    priceServiceMock = mock<PriceService>()
    feedServiceMock = mock<FeedService>()

    module = await Test.createTestingModule({
      imports: [LoggerModule, OpenTelemetryModule.forTest()],
      providers: [
        AuthorizationRequestService,
        {
          provide: AuthorizationRequestRepository,
          useValue: authzRequestRepositoryMock
        },
        {
          provide: AuthorizationRequestApprovalRepository,
          useValue: authzRequestApprovalRepository
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
        },
        {
          provide: LoggerService,
          useClass: NullLoggerService
        }
      ]
    }).compile()

    service = module.get<AuthorizationRequestService>(AuthorizationRequestService)
    statefulMetricService = module.get(MetricService)
  })

  describe('create', () => {
    it('increments create counter metric', async () => {
      await service.create(authzRequest)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'authorization_request_create_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: authzRequest.clientId
          }
        }
      ])
    })
  })

  describe('approve', () => {
    const updatedAuthzRequest: AuthorizationRequest = {
      ...authzRequest,
      approvals: [jwt]
    }

    beforeEach(() => {
      // To isolate the approve scenario, prevents the evaluation procedure to
      // run by mocking it.
      jest.spyOn(service, 'evaluate').mockResolvedValue(updatedAuthzRequest)
    })

    it('creates a new approval and evaluates the authorization request', async () => {
      authzRequestRepositoryMock.update.mockResolvedValue(updatedAuthzRequest)

      await service.approve(authzRequest.id, jwt)

      expect(authzRequestRepositoryMock.update).toHaveBeenCalledWith({
        id: authzRequest.id,
        approvals: [jwt],
        status: AuthorizationRequestStatus.APPROVING
      })
      expect(service.evaluate).toHaveBeenCalledWith(updatedAuthzRequest)
    })
  })

  describe('evaluate', () => {
    const evaluationResponse: EvaluationResponse = {
      decision: Decision.PERMIT,
      request: authzRequest.request,
      accessToken: {
        value: jwt
      },
      principal: FIXTURE.CREDENTIAL.Bob,
      transactionRequestIntent: {
        type: Intents.TRANSFER_NATIVE,
        amount: '1000000000000000000',
        to: getChainAccountId('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4'),
        from: getChainAccountId('eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b'),
        token: POLYGON.coin.id
      }
    }

    const transfers: Transfer[] = times(() => generateTransfer({ clientId: authzRequest.clientId }), 2)

    beforeEach(() => {
      clusterServiceMock.evaluate.mockResolvedValue(evaluationResponse)
      authzRequestRepositoryMock.update.mockResolvedValue(authzRequest)
      transferFeedServiceMock.findByClientId.mockResolvedValue(transfers)
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

    it('calls cluster service', async () => {
      await service.evaluate(authzRequest)

      expect(clusterServiceMock.evaluate).toHaveBeenCalledWith(
        authzRequest.clientId,
        expect.objectContaining({
          authentication: authzRequest.authentication,
          approvals: authzRequest.approvals,
          request: authzRequest.request
        })
      )
    })

    it('updates the authorization request with the evaluation response', async () => {
      await service.evaluate(authzRequest)

      expect(authzRequestRepositoryMock.update).toHaveBeenCalledWith({
        id: authzRequest.id,
        clientId: authzRequest.clientId,
        status: AuthorizationRequestStatus.PERMITTED,
        evaluations: [
          expect.objectContaining({
            id: expect.any(String),
            decision: evaluationResponse.decision,
            signature: evaluationResponse.accessToken?.value,
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
        resourceId: authzRequest.request.resourceId,
        to: intent.to,
        from: intent.from,
        token: intent.token,
        chainId: request.transactionRequest.chainId,
        clientId: authzRequest.clientId,
        requestId: authzRequest.id,
        initiatedBy: FIXTURE.CREDENTIAL.Bob.userId,
        rates: {
          'fiat:usd': 0.99
        },
        createdAt: expect.any(Date)
      })
    })

    it('increments evaluation counter metric', async () => {
      await service.evaluate(authzRequest)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'authorization_request_evaluation_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: authzRequest.clientId,
            'domain.authorization_request.status': AuthorizationRequestStatus.PERMITTED
          }
        }
      ])
    })
  })

  describe('process', () => {
    beforeEach(() => {
      authzRequestRepositoryMock.findById.mockResolvedValue({
        ...authzRequest,
        status: AuthorizationRequestStatus.PROCESSING
      })
      authzRequestRepositoryMock.update.mockResolvedValue(authzRequest)
    })

    it('throws AuthorizationRequestAlreadyProcessingException when status is PROCESSING and attempsMade reach maximum', async () => {
      await expect(service.process(authzRequest.id, AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS)).rejects.toThrow(
        AuthorizationRequestAlreadyProcessingException
      )
    })
  })
})
