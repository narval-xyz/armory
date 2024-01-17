import { load } from '@app/orchestration/orchestration.config'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  REQUEST_HEADER_ORG_ID
} from '@app/orchestration/orchestration.constant'
import { Action, AuthorizationRequest, TransactionType } from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { PolicyEngineModule } from '@app/orchestration/policy-engine/policy-engine.module'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '@app/orchestration/shared/module/queue/queue.module'
import { getQueueToken } from '@nestjs/bull'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Organization } from '@prisma/client/orchestration'
import { Queue } from 'bull'
import request from 'supertest'
import { hashMessage, stringToHex } from 'viem'

const EVALUATIONS_ENDPOINT = '/policy-engine/evaluations'

describe('Policy Engine Cluster Facade', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let authzRequestRepository: AuthorizationRequestRepository
  let authzRequestProcessingQueue: Queue

  // TODO: Create domain type
  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Evaluation',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        PolicyEngineModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    authzRequestRepository = module.get<AuthorizationRequestRepository>(AuthorizationRequestRepository)
    authzRequestProcessingQueue = module.get<Queue>(getQueueToken(AUTHORIZATION_REQUEST_PROCESSING_QUEUE))

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await authzRequestProcessingQueue.empty()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.getClient().organization.create({ data: org })
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await authzRequestProcessingQueue.empty()
  })

  describe('POST /evaluations', () => {
    it('evaluates a sign message authorization request', async () => {
      const signMessageRequest = {
        message: 'Sign me, please'
      }
      const payload = {
        action: Action.SIGN_MESSAGE,
        request: signMessageRequest,
        hash: hashMessage(JSON.stringify(signMessageRequest)),
        authentication: {
          signature: {
            hash: 'string'
          }
        },
        approval: {
          signatures: [
            {
              hash: 'string'
            }
          ]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(EVALUATIONS_ENDPOINT)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toMatchObject({
        id: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        action: payload.action,
        hash: payload.hash,
        request: payload.request,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('evaluates a sign transaction authorization request', async () => {
      const signTransactionRequest = {
        chainId: 1,
        data: '0x',
        from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
        gas: '5000',
        nonce: 0,
        to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
        type: TransactionType.EIP1559,
        value: '0x',
        accessList: [
          {
            address: '0xccc1472fce4ec74a1e3f9653776acfc790cd0743',
            storageKeys: [stringToHex('storage-key-one'), stringToHex('storage-key-two')]
          }
        ]
      }
      const payload = {
        action: Action.SIGN_TRANSACTION,
        hash: hashMessage(JSON.stringify(signTransactionRequest)),
        request: signTransactionRequest,
        authentication: {
          signature: {
            hash: 'string'
          }
        },
        approval: {
          signatures: [
            {
              hash: 'string'
            }
          ]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(EVALUATIONS_ENDPOINT)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(body).toMatchObject({
        id: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        action: payload.action,
        hash: payload.hash,
        request: payload.request,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('evaluates a partial sign transaction authorization request', async () => {
      const signTransactionRequest = {
        from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
        nonce: 0,
        chainId: 1
      }
      const payload = {
        action: Action.SIGN_TRANSACTION,
        hash: hashMessage(JSON.stringify(signTransactionRequest)),
        request: signTransactionRequest,
        authentication: {
          signature: {
            hash: 'string'
          }
        },
        approval: {
          signatures: [
            {
              hash: 'string'
            }
          ]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(EVALUATIONS_ENDPOINT)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(body).toMatchObject({
        id: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        action: payload.action,
        hash: payload.hash,
        request: payload.request,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /evaluations/:id', () => {
    const signMessageRequest = {
      message: 'Testing sign message request'
    }
    const authzRequest: AuthorizationRequest = {
      id: '986ae19d-c30c-40c6-b873-1fb6c49011de',
      orgId: org.id,
      initiatorId: 'ac792884-be18-4361-9323-8f711c3f070e',
      status: AuthorizationRequestStatus.PERMITTED,
      action: Action.SIGN_MESSAGE,
      request: signMessageRequest,
      hash: hashMessage(JSON.stringify(signMessageRequest)),
      idempotencyKey: '8dcbb7ad-82a2-4eca-b2f0-b1415c1d4a17',
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluations: []
    }

    beforeEach(async () => {
      await authzRequestRepository.create(authzRequest)
    })

    it('responds with authorization request', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${EVALUATIONS_ENDPOINT}/${authzRequest.id}`)
        .set(REQUEST_HEADER_ORG_ID, org.id)

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toEqual({
        ...authzRequest,
        createdAt: authzRequest.createdAt.toISOString(),
        updatedAt: authzRequest.createdAt.toISOString()
      })
    })
  })
})
