import { load } from '@app/orchestration/orchestration.config'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
} from '@app/orchestration/orchestration.constant'
import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import {
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus,
  Signature,
  SupportedAction
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from '@app/orchestration/policy-engine/queue/consumer/authorization-request-processing.consumer'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '@app/orchestration/shared/module/queue/queue.module'
import { createMock } from '@golevelup/ts-jest'
import { HttpModule } from '@nestjs/axios'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization } from '@prisma/client/orchestration'
import { Job, Queue } from 'bull'

describe(AuthorizationRequestProcessingConsumer.name, () => {
  let module: TestingModule
  let queue: Queue<AuthorizationRequestProcessingJob>
  let service: AuthorizationRequestService
  let repository: AuthorizationRequestRepository
  let consumer: AuthorizationRequestProcessingConsumer
  let testPrismaService: TestPrismaService

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Org',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication: Signature = {
    sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c',
    alg: 'ES256K',
    pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
  }

  const authzRequest: AuthorizationRequest = {
    authentication,
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    orgId: org.id,
    status: AuthorizationRequestStatus.PROCESSING,
    request: {
      action: SupportedAction.SIGN_MESSAGE,
      nonce: 99,
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
    orgId: org.id,
    requestId: authzRequest.id,
    decision: 'Permit',
    signature: 'test-signature',
    createdAt: new Date()
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        BullModule.registerQueue({
          name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE
        }),
        HttpModule
      ],
      providers: [
        AuthorizationRequestProcessingConsumer,
        AuthorizationRequestProcessingProducer,
        AuthorizationRequestRepository,
        AuthorizationRequestService
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    queue = module.get<Queue>(getQueueToken(AUTHORIZATION_REQUEST_PROCESSING_QUEUE))
    service = module.get<AuthorizationRequestService>(AuthorizationRequestService)
    repository = module.get<AuthorizationRequestRepository>(AuthorizationRequestRepository)
    consumer = module.get<AuthorizationRequestProcessingConsumer>(AuthorizationRequestProcessingConsumer)

    await testPrismaService.getClient().organization.create({ data: org })
    await repository.create(authzRequest)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await queue.empty()
    await module.close()
  })

  describe('process', () => {
    it('calls the service to process the authorization request job', async () => {
      // Prevent calling the node at the evaluation phase.
      jest.spyOn(service, 'evaluate').mockResolvedValue({
        ...authzRequest,
        status: AuthorizationRequestStatus.PERMITTED,
        evaluations: [permitEvaluation]
      })

      jest.spyOn(service, 'process')

      const job = createMock<Job<AuthorizationRequestProcessingJob>>({
        id: authzRequest.id,
        opts: {
          jobId: authzRequest.id
        }
      })

      await consumer.process(job)

      expect(service.process).toHaveBeenCalledWith(authzRequest.id)
    })
  })

  describe('onFailure', () => {
    describe('when exceed max attemps', () => {
      it('changes the request status to failed', async () => {
        const job = createMock<Job<AuthorizationRequestProcessingJob>>({
          id: authzRequest.id,
          opts: {
            jobId: authzRequest.id
          },
          attemptsMade: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
        })

        await consumer.onFailure(job, new Error('Some error'))

        const request = await repository.findById(authzRequest.id)

        expect(request?.status).toEqual(AuthorizationRequestStatus.FAILED)
      })
    })
  })
})
