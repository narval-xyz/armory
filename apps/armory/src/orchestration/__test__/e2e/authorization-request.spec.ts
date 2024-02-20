import { Action, Alg } from '@narval/authz-shared'
import { getQueueToken } from '@nestjs/bull'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Organization } from '@prisma/client/armory'
import { Queue } from 'bull'
import request from 'supertest'
import { stringToHex } from 'viem'
import { load } from '../../../armory.config'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE, REQUEST_HEADER_ORG_ID } from '../../../armory.constant'
import { AuthorizationRequest } from '../../../orchestration/core/type/domain.type'
import { SignatureDto } from '../../../orchestration/http/rest/dto/signature.dto'
import { AuthorizationRequestRepository } from '../../../orchestration/persistence/repository/authorization-request.repository'
import { PersistenceModule } from '../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../shared/module/queue/queue.module'
import { OrchestrationModule } from '../../orchestration.module'

const ENDPOINT_PREFIX = '/authorization-requests'

describe('Authorization Request', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let authzRequestRepository: AuthorizationRequestRepository
  let authzRequestProcessingQueue: Queue

  const authentication: SignatureDto = {
    alg: Alg.ES256K,
    pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890',
    sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'
  }

  const approvals: SignatureDto[] = [
    {
      alg: Alg.ES256K,
      pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06',
      sig: '0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b'
    },
    {
      alg: Alg.ES256K,
      pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e',
      sig: '0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c'
    }
  ]

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
        OrchestrationModule
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
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '5cfb8614-ddeb-4764-bf85-8d323f26d3b3',
          message: 'Sign me, please'
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT_PREFIX)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(body).toMatchObject({
        approvals,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        request: payload.request,
        evaluations: []
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('evaluates a sign transaction authorization request', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: '99',
          resourceId: '68dc69bd-87d2-49d9-a5de-f482507b25c2',
          transactionRequest: {
            chainId: 1,
            data: '0x',
            from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
            gas: '5000',
            nonce: 0,
            to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
            type: '2',
            value: '0x',
            accessList: [
              {
                address: '0xccc1472fce4ec74a1e3f9653776acfc790cd0743',
                storageKeys: [stringToHex('storage-key-one'), stringToHex('storage-key-two')]
              }
            ]
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT_PREFIX)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(body).toMatchObject({
        approvals,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        request: payload.request,
        evaluations: []
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('evaluates a partial sign transaction authorization request', async () => {
      const payload = {
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: '99',
          resourceId: '68dc69bd-87d2-49d9-a5de-f482507b25c2',
          transactionRequest: {
            from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
            chainId: 1
          }
        },
        authentication,
        approvals
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT_PREFIX)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(body).toMatchObject({
        approvals,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        request: payload.request,
        evaluations: []
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('GET /evaluations/:id', () => {
    const authzRequest: AuthorizationRequest = {
      authentication,
      id: '986ae19d-c30c-40c6-b873-1fb6c49011de',
      orgId: org.id,
      status: AuthorizationRequestStatus.PERMITTED,
      request: {
        action: Action.SIGN_MESSAGE,
        nonce: '99',
        resourceId: '5cfb8614-ddeb-4764-bf85-8d323f26d3b3',
        message: 'Testing sign message request'
      },
      idempotencyKey: '8dcbb7ad-82a2-4eca-b2f0-b1415c1d4a17',
      evaluations: [],
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    beforeEach(async () => {
      await authzRequestRepository.create(authzRequest)
    })

    it('responds with authorization request', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${ENDPOINT_PREFIX}/${authzRequest.id}`)
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
