import { ConfigModule } from '@narval/config-module'
import { LoggerModule, OpenTelemetryModule, REQUEST_HEADER_CLIENT_ID, secret } from '@narval/nestjs-shared'
import { Action, AuthorizationRequest, Eip712TypedData, FIXTURE, Request } from '@narval/policy-engine-shared'
import { getQueueToken } from '@nestjs/bull'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Client, Prisma } from '@prisma/client/armory'
import { Queue } from 'bull'
import { mock } from 'jest-mock-extended'
import request from 'supertest'
import { stringToHex } from 'viem'
import { load } from '../../../armory.config'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '../../../armory.constant'
import { PersistenceModule } from '../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../shared/module/queue/queue.module'
import { OrchestrationModule } from '../../orchestration.module'
import { AuthorizationRequestRepository } from '../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from '../../queue/consumer/authorization-request-processing.consumer'

const ENDPOINT = '/authorization-requests'

describe('Authorization Request', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let authzRequestRepository: AuthorizationRequestRepository
  let authzRequestProcessingQueue: Queue

  const authentication =
    '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'

  const approvals: string[] = [
    '0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b',
    '0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c'
  ]

  // TODO: Create domain type
  const client: Client = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    clientSecret: secret.hash('test-client-secret'),
    dataSecret: secret.hash('test-data-secret'),
    name: 'Test Evaluation',
    enginePublicKey: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        OpenTelemetryModule.forTest(),
        OrchestrationModule
      ]
    })
      // Pauses the processing queue to simplify the test. Here we want to make
      // sure jobs are added to the queue not the processing. The processing
      // correctness is covered by the consumer integration test.
      .overrideProvider(AuthorizationRequestProcessingConsumer)
      .useValue(mock<AuthorizationRequestProcessingConsumer>())
      .compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    authzRequestRepository = module.get<AuthorizationRequestRepository>(AuthorizationRequestRepository)
    authzRequestProcessingQueue = module.get<Queue>(getQueueToken(AUTHORIZATION_REQUEST_PROCESSING_QUEUE))

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await authzRequestProcessingQueue.resume()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
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
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await authzRequestProcessingQueue.empty()
  })

  describe(`POST ${ENDPOINT}`, () => {
    it('evaluates a sign typed data authorization request', async () => {
      const typedData: Eip712TypedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ]
        },
        primaryType: 'Person',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        },
        message: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
        }
      }

      const req: Request = {
        action: Action.SIGN_TYPED_DATA,
        nonce: '99',
        resourceId: '5cfb8614-ddeb-4764-bf85-8d323f26d3b3',
        typedData
      }

      const payload = {
        authentication,
        approvals,
        request: req
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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

    it('evaluates a grant permission authorization request', async () => {
      const payload = {
        request: {
          action: Action.GRANT_PERMISSION,
          resourceId: 'vault',
          nonce: '84cc19b4-85ba-426f-a4e0-f2e6a949d81f',
          permissions: ['wallet:create', 'wallet:read', 'wallet:import']
        },
        metadata: {
          expiresIn: 600
        },
        authentication,
        approvals
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
        .send(payload)

      expect(body).toMatchObject({
        approvals,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        status: AuthorizationRequestStatus.CREATED,
        idempotencyKey: null,
        request: payload.request,
        evaluations: [],
        metadata: payload.metadata
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('evaluates a signRaw authorization request', async () => {
      const payload = {
        request: {
          action: Action.SIGN_RAW,
          nonce: '99',
          resourceId: '68dc69bd-87d2-49d9-a5de-f482507b25c2',
          rawMessage: '0x434959f872879eb82c3e3d8139bc4894482de5e7a5bbfdf8624b4d45cf2c5868'
        },
        authentication,
        approvals
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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

    it('evaluates a signUserOperation request', async () => {
      const req = {
        action: 'signUserOperation',
        nonce: 'e1c8a972-3828-4046-abaf-eda251bf56bd',
        resourceId: 'eip155:eoa:0xd9d431ad45d96dd9eeb05dd0a7d66876d1d74c4b',
        userOperation: {
          sender: '0xcAF631599aE86A39F850668397dF5C5f6C4c75ee',
          nonce: '0',
          initCode:
            '0x9406Cc6185a346906296840746125a0E449764545fbfb9cf000000000000000000000000d93473015c502ba93ce4fa2145ee0fe58a09451d0000000000000000000000000000000000000000000000000000000000000000',
          callData:
            '0xb61d27f6000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          callGasLimit: '82511',
          verificationGasLimit: '526140',
          preVerificationGas: '65925',
          maxFeePerGas: '31921175875',
          maxPriorityFeePerGas: '506941965',
          paymasterAndData:
            '0xDFF7FA1077Bce740a6a212b3995990682c0Ba66d000000000000000000000000000000000000000000000000000000006686cf2d0000000000000000000000000000000000000000000000000000000000000000b4a531940971ef584e248dd46ca42ddecfa47e8529ff5dbcd9b6c533ce29b36a4ebcba1c40bbd1ed3347566fd6528063d35fbe288c6197a2b5566c1ca50bbe8d1c',
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          signature:
            '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
          factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454',
          chainId: 11155111
        }
      }

      const payload = {
        request: req,
        authentication,
        approvals
      }

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)
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

  describe(`GET ${ENDPOINT}/:id`, () => {
    const authzRequest: AuthorizationRequest = {
      authentication,
      id: '986ae19d-c30c-40c6-b873-1fb6c49011de',
      clientId: client.id,
      status: AuthorizationRequestStatus.PERMITTED,
      request: {
        action: Action.SIGN_MESSAGE,
        nonce: '99',
        resourceId: '5cfb8614-ddeb-4764-bf85-8d323f26d3b3',
        message: 'Testing sign message request'
      },
      metadata: {
        expiresIn: 3600
      },
      idempotencyKey: '8dcbb7ad-82a2-4eca-b2f0-b1415c1d4a17',
      evaluations: [],
      approvals: [],
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    beforeEach(async () => {
      await authzRequestRepository.create(authzRequest)
    })

    it('responds with authorization request', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${ENDPOINT}/${authzRequest.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, client.id)

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toEqual({
        ...authzRequest,
        createdAt: authzRequest.createdAt.toISOString(),
        updatedAt: authzRequest.createdAt.toISOString()
      })
    })
  })
})
