import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { RsaPublicKey, rsaEncrypt, rsaPublicKeySchema, secp256k1PrivateKeyToJwk } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { load } from '../../../main.config'
import { REQUEST_HEADER_API_KEY, REQUEST_HEADER_CLIENT_ID } from '../../../main.constant'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Tenant } from '../../../shared/type/domain.type'
import { TenantService } from '../../../tenant/core/service/tenant.service'
import { TenantModule } from '../../../tenant/tenant.module'

describe('Import', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  const adminApiKey = 'test-admin-api-key'
  const clientId = uuid()

  const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  // Engine public key registered w/ the Vault Tenant
  // eslint-disable-next-line
  const { d, ...tenantPublicJWK } = enginePrivateJwk

  const tenant: Tenant = {
    clientId,
    clientSecret: adminApiKey,
    engineJwk: tenantPublicJWK,
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
      .compile()

    app = module.createNestApplication({ logger: false })
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    await testPrismaService.truncateAll()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /encryption-key', () => {
    it('has client secret guard', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        // .set(REQUEST_HEADER_CLIENT_ID, clientId)  NO CLIENT SECRET
        .send({})

      expect(status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    it('generates an RSA keypair', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({})

      expect(status).toEqual(HttpStatus.CREATED)

      expect(body).toEqual({
        publicKey: expect.objectContaining({
          kid: expect.any(String),
          kty: 'RSA',
          use: 'enc',
          alg: 'RS256',
          n: expect.any(String),
          e: expect.any(String)
        })
      })
    })
  })

  describe('POST /private-key', () => {
    it('imports an unencrypted private key', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/import/private-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({
          privateKey: PRIVATE_KEY
        })

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({
        id: 'eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
    })

    it('imports a JWE-encrypted private key', async () => {
      const { body: keygenBody } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({})
      const rsPublicKey: RsaPublicKey = rsaPublicKeySchema.parse(keygenBody.publicKey)

      const jwe = await rsaEncrypt(PRIVATE_KEY, rsPublicKey)

      const { status, body } = await request(app.getHttpServer())
        .post('/import/private-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({
          encryptedPrivateKey: jwe
        })

      expect(body).toEqual({
        id: 'eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
