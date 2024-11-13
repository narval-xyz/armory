import { Permission } from '@narval/armory-sdk'
import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID, secret } from '@narval/nestjs-shared'
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
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client, Origin } from '../../../shared/type/domain.type'
import { AppService } from '../../core/service/app.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Accounts', () => {
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
        LoggerModule.forTest(),
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
      adminApiKey: secret.hash('test-admin-api-key')
    })

    await clientService.save(client)
  })

  describe('GET /accounts', () => {
    it('list all accounts for a specific client', async () => {
      const secondClientId = uuid()
      await clientService.save({
        clientId: secondClientId,
        engineJwk: clientPublicJWK,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const accessToken = await getAccessToken([Permission.WALLET_READ])
      const { body: firstMnemonicRequest } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { body: secondMnemonicRequest } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-2'
        })

      const { body: firstDeriveRequest } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId',
          derivationPaths: ['next']
        })

      const { body: secondDeriveRequest } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-2',
          derivationPaths: ['next']
        })

      const accounts = [
        firstMnemonicRequest.account,
        secondMnemonicRequest.account,
        firstDeriveRequest.accounts,
        secondDeriveRequest.accounts
      ]

      await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-second-client'
        })

      const { body } = await request(app.getHttpServer())
        .get('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      expect(body).toEqual({ accounts })
    })
  })

  describe('POST /accounts', () => {
    it('derives a new account from a wallet', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId
        })

      expect(body).toEqual({
        accounts: [
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/1",
            address: expect.any(String),
            publicKey: expect.any(String),
            origin: Origin.GENERATED
          }
        ]
      })
    })

    it('responds with not found when wallet does not exist', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { status } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'somekeyId'
        })

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })

    it('derives multiple accounts from a wallet', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          count: 3
        })

      expect(body.accounts).toEqual([
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/1",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        },
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/2",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        },
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/3",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        }
      ])
    })

    it('derives accounts from a wallet with custom derivation paths', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          derivationPaths: ["m/44'/60'/0'/0/4", "m/44'/60'/0'/0/5"]
        })

      expect(body.accounts).toEqual([
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/4",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        },
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/5",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        }
      ])
    })

    it('derives a combination of custom derivation paths and next possible accounts', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          count: 2,
          derivationPaths: ["m/44'/60'/0'/0/4", "m/44'/60'/0'/0/5"]
        })

      expect(body.accounts).toEqual([
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/4",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        },
        {
          id: expect.any(String),
          keyId,
          derivationPath: "m/44'/60'/0'/0/5",
          address: expect.any(String),
          publicKey: expect.any(String),
          origin: Origin.GENERATED
        }
      ])
    })
  })

  describe('POST /import', () => {
    it('imports an unencrypted private key', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_IMPORT])

      const { status, body } = await request(app.getHttpServer())
        .post('/accounts/import')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          privateKey: PRIVATE_KEY
        })

      expect(body).toEqual({
        id: 'eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        publicKey: expect.any(String),
        origin: Origin.IMPORTED
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('imports a jwe-encrypted private key', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_IMPORT])
      const { body: keygenBody } = await request(app.getHttpServer())
        .post('/encryption-keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({})

      const rsPublicKey: RsaPublicKey = rsaPublicKeySchema.parse(keygenBody.publicKey)

      const jwe = await rsaEncrypt(PRIVATE_KEY, rsPublicKey)

      const { status, body } = await request(app.getHttpServer())
        .post('/accounts/import')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('Authorization', `GNAP ${await getAccessToken([Permission.WALLET_IMPORT])}`)
        .send({
          encryptedPrivateKey: jwe
        })

      expect(body).toEqual({
        id: 'eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        publicKey: expect.any(String),
        origin: Origin.IMPORTED
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
