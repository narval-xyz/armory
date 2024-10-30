import { ConfigModule } from '@narval/config-module'
import { LoggerModule, OpenTelemetryModule, secret } from '@narval/nestjs-shared'
import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus,
  FIXTURE
} from '@narval/policy-engine-shared'
import { Alg, JwtError, generateJwk, getPublicKey } from '@narval/signature'
import { HttpModule } from '@nestjs/axios'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { Client, Prisma } from '@prisma/client/armory'
import { Job, Queue } from 'bull'
import { mock } from 'jest-mock-extended'
import { load } from '../../../../../armory.config'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
} from '../../../../../armory.constant'
import { FeedService } from '../../../../../data-feed/core/service/feed.service'
import { AuthorizationRequestApprovalRepository } from '../../../../../orchestration/persistence/repository/authorization-request-approval.repository'
import { ClusterNotFoundException } from '../../../../../policy-engine/core/exception/cluster-not-found.exception'
import { ConsensusAgreementNotReachException } from '../../../../../policy-engine/core/exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../../../../../policy-engine/core/exception/invalid-attestation-signature.exception'
import { UnreachableClusterException } from '../../../../../policy-engine/core/exception/unreachable-cluster.exception'
import { ClusterService } from '../../../../../policy-engine/core/service/cluster.service'
import { PolicyEngineModule } from '../../../../../policy-engine/policy-engine.module'
import { PriceService } from '../../../../../price/core/service/price.service'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../../shared/module/queue/queue.module'
import { TransferTrackingService } from '../../../../../transfer-tracking/core/service/transfer-tracking.service'
import { AuthorizationRequestAlreadyProcessingException } from '../../../../core/exception/authorization-request-already-processing.exception'
import { AuthorizationRequestService } from '../../../../core/service/authorization-request.service'
import { AuthorizationRequestRepository } from '../../../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from '../../../../queue/consumer/authorization-request-processing.consumer'
import { AuthorizationRequestProcessingProducer } from '../../../../queue/producer/authorization-request-processing.producer'

describe(AuthorizationRequestProcessingConsumer.name, () => {
  let module: TestingModule
  let queue: Queue<AuthorizationRequestProcessingJob>
  let service: AuthorizationRequestService
  let repository: AuthorizationRequestRepository
  let consumer: AuthorizationRequestProcessingConsumer
  let testPrismaService: TestPrismaService

  const client: Client = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    clientSecret: secret.hash('test-client-secret'),
    dataSecret: secret.hash('test-data-secret'),
    name: 'Test Client',
    enginePublicKey: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication =
    '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'

  const authzRequest: AuthorizationRequest = {
    authentication,
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    clientId: client.id,
    status: AuthorizationRequestStatus.PROCESSING,
    request: {
      action: Action.SIGN_MESSAGE,
      nonce: '99',
      resourceId: '239bb48b-f708-47ba-97fa-ef336be4dffe',
      message: 'Test request'
    },
    idempotencyKey: null,
    evaluations: [],
    approvals: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const permitEvaluation = {
    id: '404853b2-1338-47f5-be17-a1aa78da8010',
    clientId: client.id,
    requestId: authzRequest.id,
    decision: 'Permit',
    signature: 'test-signature',
    createdAt: new Date()
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        BullModule.registerQueue({
          name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE
        }),
        OpenTelemetryModule.forTest(),
        HttpModule,
        PolicyEngineModule
      ],
      providers: [
        AuthorizationRequestProcessingConsumer,
        AuthorizationRequestProcessingProducer,
        AuthorizationRequestRepository,
        AuthorizationRequestApprovalRepository,
        AuthorizationRequestService,
        {
          provide: TransferTrackingService,
          useValue: mock<TransferTrackingService>()
        },
        {
          provide: ClusterService,
          useValue: mock<ClusterService>()
        },
        {
          provide: PriceService,
          useValue: mock<PriceService>()
        },
        {
          provide: FeedService,
          useValue: mock<FeedService>()
        }
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    queue = module.get<Queue>(getQueueToken(AUTHORIZATION_REQUEST_PROCESSING_QUEUE))
    service = module.get<AuthorizationRequestService>(AuthorizationRequestService)
    repository = module.get<AuthorizationRequestRepository>(AuthorizationRequestRepository)
    consumer = module.get<AuthorizationRequestProcessingConsumer>(AuthorizationRequestProcessingConsumer)

    await testPrismaService.getClient().client.create({
      data: {
        ...client,
        enginePublicKey: client.enginePublicKey as Prisma.InputJsonValue,
        dataStoreKeys: {
          create: [
            {
              storeType: 'entity',
              publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
            },
            {
              storeType: 'policy',
              publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
            }
          ]
        }
      }
    })
    await repository.create(authzRequest)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await queue.empty()
    await module.close()
  })

  describe('process', () => {
    const job = mock<Job<AuthorizationRequestProcessingJob>>({
      id: authzRequest.id,
      opts: {
        jobId: authzRequest.id
      }
    })

    it('calls the service to process the authorization request job', async () => {
      // Prevent calling the node at the evaluation phase.
      jest.spyOn(service, 'evaluate').mockResolvedValue({
        ...authzRequest,
        status: AuthorizationRequestStatus.PERMITTED,
        evaluations: [permitEvaluation]
      })

      jest.spyOn(service, 'process')

      await consumer.process(job)

      expect(service.process).toHaveBeenCalledWith(authzRequest.id, job.attemptsMade)
    })

    // Before you start with these tests, learn how Bull works. Jobs in Bull can
    // retry, but we don't want retries for certain errors. To stop a job from
    // retrying, the process method needs to return an error instance. In
    // contrast, to let the retry happen, the process method must throw.
    describe('when job fails', () => {
      it('retries on unknown error', async () => {
        const error = new Error('unknown error')
        jest.spyOn(service, 'process').mockRejectedValue(error)

        await expect(consumer.process(job)).rejects.toThrow(error)
      })

      it('stops retrying on known unrecoverable errors', async () => {
        const publicKey = getPublicKey(await generateJwk(Alg.ES256K))

        const unrecoverableErrors = [
          new ClusterNotFoundException(authzRequest.clientId),
          new ConsensusAgreementNotReachException([], []),
          new UnreachableClusterException(authzRequest.clientId, []),
          new InvalidAttestationSignatureException(
            'test-auth-token',
            publicKey,
            new JwtError({ message: 'Test JWT error' })
          ),
          new AuthorizationRequestAlreadyProcessingException(authzRequest)
        ]

        expect.assertions(unrecoverableErrors.length)

        unrecoverableErrors.forEach(async (error) => {
          jest.spyOn(service, 'process').mockRejectedValue(error)

          expect(await consumer.process(job)).toEqual(error)
        })
      })
    })
  })

  describe('onFailure', () => {
    describe('when exceed max attemps', () => {
      it('changes the request status to failed', async () => {
        const job = mock<Job<AuthorizationRequestProcessingJob>>({
          id: authzRequest.id,
          opts: {
            jobId: authzRequest.id
          },
          attemptsMade: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
        })

        await consumer.onFailure(job, { name: 'Some error name', message: 'Some error message' })

        const request = await repository.findById(authzRequest.id)

        expect(request?.status).toEqual(AuthorizationRequestStatus.FAILED)
      })
    })
  })

  describe('onCompleted', () => {
    const job = mock<Job<AuthorizationRequestProcessingJob>>({
      id: authzRequest.id,
      opts: {
        jobId: authzRequest.id
      }
    })

    it('changes the request status to failed on unrecoverable errors', async () => {
      await consumer.onCompleted(job, new ClusterNotFoundException(authzRequest.clientId))

      const request = await repository.findById(authzRequest.id)

      expect(request?.status).toEqual(AuthorizationRequestStatus.FAILED)
    })
  })
})
