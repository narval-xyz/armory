import { load } from '@app/orchestration/orchestration.config'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '@app/orchestration/orchestration.constant'
import {
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus,
  SupportedAction
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import {
  AuthorizationRequestProcessingProducer,
  DEFAULT_JOB_OPTIONS
} from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '@app/orchestration/shared/module/queue/queue.module'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'

describe(AuthorizationRequestProcessingProducer.name, () => {
  let module: TestingModule
  let queue: Queue<AuthorizationRequestProcessingJob>
  let producer: AuthorizationRequestProcessingProducer
  let testPrismaService: TestPrismaService

  const authzRequest: AuthorizationRequest = {
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    orgId: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    initiatorId: 'bob',
    status: AuthorizationRequestStatus.CREATED,
    action: SupportedAction.SIGN_MESSAGE,
    request: {
      message: 'Test request'
    },
    hash: 'test-hash',
    idempotencyKey: null,
    evaluations: [],
    createdAt: new Date(),
    updatedAt: new Date()
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
        })
      ],
      providers: [AuthorizationRequestProcessingProducer, AuthorizationRequestRepository]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    queue = module.get<Queue>(getQueueToken(AUTHORIZATION_REQUEST_PROCESSING_QUEUE))
    producer = module.get<AuthorizationRequestProcessingProducer>(AuthorizationRequestProcessingProducer)

    await queue.pause()
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await queue.empty()
    await module.close()
  })

  describe('add', () => {
    it('adds a processing job with default options in the queue', async () => {
      const actualJob = await producer.add(authzRequest)

      const job = await queue.getJob(actualJob.id)

      expect(job).not.toEqual(null)
      expect(job?.opts).toMatchObject({
        jobId: authzRequest.id,
        delay: 0,
        ...DEFAULT_JOB_OPTIONS,
        timestamp: expect.any(Number)
      })
    })
  })

  describe('bulkAdd', () => {
    it('adds a bulk of jobs with default options in the queue', async () => {
      const [authzRequestOne, authzRequestTwo] = [
        {
          ...authzRequest,
          id: 'fd73fc63-abb7-47e4-8200-46b383b890f9'
        },
        {
          ...authzRequest,
          id: '4b6391c6-b3ba-427f-920a-3418d7abf454'
        }
      ]

      const [actualJobOne, actualJobTwo] = await producer.bulkAdd([authzRequestOne, authzRequestTwo])
      const jobOne = await queue.getJob(actualJobOne.id)
      const jobTwo = await queue.getJob(actualJobTwo.id)

      expect(jobOne).not.toEqual(null)
      expect(jobTwo).not.toEqual(null)

      expect(jobOne?.opts).toMatchObject({
        jobId: authzRequestOne.id,
        delay: 0,
        ...DEFAULT_JOB_OPTIONS,
        timestamp: expect.any(Number)
      })
      expect(jobTwo?.opts).toMatchObject({
        jobId: authzRequestTwo.id,
        delay: 0,
        ...DEFAULT_JOB_OPTIONS,
        timestamp: expect.any(Number)
      })
    })
  })
})
