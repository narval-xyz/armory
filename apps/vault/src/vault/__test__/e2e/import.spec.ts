import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { Permission } from '@narval/policy-engine-shared'
import {
  Payload,
  RsaPublicKey,
  SigningAlg,
  buildSignerEip191,
  rsaEncrypt,
  rsaPublicKeySchema,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  signJwt
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientModule } from '../../../client/client.module'
import { ClientService } from '../../../client/core/service/client.service'
import { load } from '../../../main.config'
import { REQUEST_HEADER_CLIENT_ID } from '../../../main.constant'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client } from '../../../shared/type/domain.type'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Import', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  const clientId = uuid()
  const clientSecret = 'test-client-secret'

  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
    clientSecret,
    engineJwk: clientPublicJWK,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const getAccessToken = async (permissions: Permission[], opts: object = {}) => {
    const payload: Payload = {
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000),
      access: [
        {
          resource: 'vault',
          permissions
        }
      ],
      ...opts
    }
    const signer = buildSignerEip191(PRIVATE_KEY)

    return signJwt(payload, enginePrivateJwk, { alg: SigningAlg.EIP191 }, signer)
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        ClientModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .overrideProvider(ClientService)
      .useValue({
        findAll: jest.fn().mockResolvedValue([client]),
        findByClientId: jest.fn().mockResolvedValue(client)
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
    it('generates an RSA keypair', async () => {
      const accessToken = await getAccessToken(['wallet:import'])

      const { status, body } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
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
      const accessToken = await getAccessToken(['wallet:import'])

      const { status, body } = await request(app.getHttpServer())
        .post('/import/private-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
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
      const accessToken = await getAccessToken(['wallet:import'])

      const { body: keygenBody } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({})

      const rsPublicKey: RsaPublicKey = rsaPublicKeySchema.parse(keygenBody.publicKey)

      const jwe = await rsaEncrypt(PRIVATE_KEY, rsPublicKey)

      const { status, body } = await request(app.getHttpServer())
        .post('/import/private-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('Authorization', `GNAP ${await getAccessToken(['wallet:import'])}`)
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
