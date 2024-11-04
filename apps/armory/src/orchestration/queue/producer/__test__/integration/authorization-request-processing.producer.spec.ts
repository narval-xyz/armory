import { ConfigModule } from '@narval/config-module'
import { LoggerModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus
} from '@narval/policy-engine-shared'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'
import { load } from '../../../../../armory.config'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '../../../../../armory.constant'
import { PolicyEngineModule } from '../../../../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../../shared/module/queue/queue.module'
import { AuthorizationRequestRepository } from '../../../../persistence/repository/authorization-request.repository'
import {
  AuthorizationRequestProcessingProducer,
  DEFAULT_JOB_OPTIONS
} from '../../../../queue/producer/authorization-request-processing.producer'

describe(AuthorizationRequestProcessingProducer.name, () => {
  let module: TestingModule
  let queue: Queue<AuthorizationRequestProcessingJob>
  let producer: AuthorizationRequestProcessingProducer
  let testPrismaService: TestPrismaService

  const authentication =
    '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'

  const authzRequest: AuthorizationRequest = {
    authentication,
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    clientId: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    status: AuthorizationRequestStatus.CREATED,
    request: {
      action: Action.SIGN_MESSAGE,
      nonce: '99',
      resourceId: '15d13f33-b7fb-4b96-b8c2-f35c6b2f64dd',
      message: 'Test request'
    },
    idempotencyKey: null,
    evaluations: [],
    approvals: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        QueueModule.forRoot(),
        OpenTelemetryModule.forTest(),
        BullModule.registerQueue({
          name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE
        }),
        PolicyEngineModule
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
