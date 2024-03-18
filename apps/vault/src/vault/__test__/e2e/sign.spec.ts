import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { load } from '../../../main.config'
import { REQUEST_HEADER_API_KEY, REQUEST_HEADER_CLIENT_ID } from '../../../main.constant'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Tenant, Wallet } from '../../../shared/type/domain.type'
import { TenantService } from '../../../tenant/core/service/tenant.service'
import { TenantModule } from '../../../tenant/tenant.module'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

describe('Sign', () => {
  let app: INestApplication
  let module: TestingModule

  const adminApiKey = 'test-admin-api-key'
  const clientId = uuid()
  const tenant: Tenant = {
    clientId,
    clientSecret: adminApiKey,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const wallet: Wallet = {
    id: 'eip155:eoa:0xc3bdcdb4f593aa5a5d81cd425f6fc3265d962157',
    address: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        TenantModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .overrideProvider(TenantService)
      .useValue({
        findAll: jest.fn().mockResolvedValue([tenant]),
        findByClientId: jest.fn().mockResolvedValue(tenant)
      })
      .overrideProvider(WalletRepository)
      .useValue({
        findById: jest.fn().mockResolvedValue(wallet)
      })
      .compile()

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    // await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /sign', () => {
    it('has client secret guard', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        // .set(REQUEST_HEADER_CLIENT_ID, clientId)  NO CLIENT SECRET
        .send({})

      expect(status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    it('validates nested txn data', async () => {
      // ValidationPipe & Transforms can easily be implemented incorrectly, so make sure this is running.

      const payload = {
        request: {
          action: 'signTransaction',
          nonce: 'random-nonce-111',
          transactionRequest: {
            from: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
            to: '04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B', // INVALID
            chainId: 137,
            value: '0x5af3107a4000',
            data: '0x',
            nonce: 317,
            type: '2',
            gas: '21004',
            maxFeePerGas: '291175227375',
            maxPriorityFeePerGas: '81000000000'
          },
          resourceId: 'eip155:eoa:0xc3bdcdb4f593aa5a5d81cd425f6fc3265d962157'
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send(payload)

      expect(status).toEqual(HttpStatus.BAD_REQUEST)

      expect(body).toEqual({
        error: 'Bad Request',
        message: ['request.transactionRequest.to must be an Ethereum address'],
        statusCode: HttpStatus.BAD_REQUEST
      })
    })

    it('signs', async () => {
      const payload = {
        request: {
          action: 'signTransaction',
          nonce: 'random-nonce-111',
          transactionRequest: {
            from: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
            to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
            chainId: 137,
            value: '0x5af3107a4000',
            data: '0x',
            nonce: 317,
            type: '2',
            gas: '21004',
            maxFeePerGas: '291175227375',
            maxPriorityFeePerGas: '81000000000'
          },
          resourceId: 'eip155:eoa:0xc3bdcdb4f593aa5a5d81cd425f6fc3265d962157'
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send(payload)

      expect(status).toEqual(HttpStatus.CREATED)

      expect(body).toEqual({
        signature:
          '0x02f875818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba06f7648a9c9710b171d55e056c4abca268857f607a8a4a257d945fc44ace9f076'
      })
    })
  })
})
