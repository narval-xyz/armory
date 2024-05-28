import { Permission } from '@narval/armory-sdk'
import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
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
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientModule } from '../../../client/client.module'
import { ClientService } from '../../../client/core/service/client.service'
import { Config, load } from '../../../main.config'
import { REQUEST_HEADER_CLIENT_ID } from '../../../main.constant'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client } from '../../../shared/type/domain.type'
import { AppService } from '../../core/service/app.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Import', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let appService: AppService
  let clientService: ClientService
  let configService: ConfigService<Config>

  const clientId = uuid()

  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
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
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication({ logger: false })

    appService = module.get<AppService>(AppService)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    clientService = module.get<ClientService>(ClientService)
    configService = module.get<ConfigService<Config>>(ConfigService)

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await appService.save({
      id: configService.get('app.id'),
      masterKey: 'test-master-key',
      adminApiKey: 'test-admin-api-key',
      activated: true
    })

    await clientService.save(client)
  })

  describe('POST /encryption-key', () => {
    it('responds with unauthorized when client secret is missing', async () => {
      const { status } = await request(app.getHttpServer()).post('/import/encryption-key').send()

      expect(status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    it('generates an RSA keypair', async () => {
      const accessToken = await getAccessToken(['wallet:import'])

      const { status, body } = await request(app.getHttpServer())
        .post('/import/encryption-key')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({})

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
      expect(status).toEqual(HttpStatus.CREATED)
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

      expect(body).toEqual({
        id: 'eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('imports a jwe-encrypted private key', async () => {
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
