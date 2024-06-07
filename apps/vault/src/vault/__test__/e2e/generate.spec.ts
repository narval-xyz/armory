import { Permission } from '@narval/armory-sdk'
import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import {
  Alg,
  Payload,
  RsaPrivateKey,
  SigningAlg,
  buildSignerEip191,
  generateJwk,
  rsaDecrypt,
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

describe('Generate', () => {
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
      adminApiKey: secret.hash('test-admin-api-key')
    })

    await clientService.save(client)
  })

  describe('POST /generate/key', () => {
    it('generates a new mnemonic', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      expect(body.wallet).toEqual({
        keyId: 'keyId',
        derivationPath: "m/44'/60'/0'/0/0",
        address: expect.any(String),
        publicKey: expect.any(String),
        id: expect.any(String)
      })
    })
    it('saves a backup when client got a backupKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])
      const keyId = 'backupKeyId'
      const backupKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { keyId })

      const clientWithBackupKey: Client = {
        ...client,
        clientId: uuid(),
        backupPublicKey: rsaPublicKeySchema.parse(backupKey)
      }
      await clientService.save(clientWithBackupKey)

      const { body } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientWithBackupKey.clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const decryptedMnemonic = await rsaDecrypt(body.backup as string, backupKey)
      const spaceInMnemonic = decryptedMnemonic.split(' ')
      expect(spaceInMnemonic.length).toBe(12)
    })
  })
  describe('POST /derive/wallets', () => {
    it('derives a new wallet from a rootKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId
        })

      expect(body).toEqual({
        wallets: [
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/1",
            address: expect.any(String),
            publicKey: expect.any(String)
          }
        ]
      })
    })
    it('responds with not found when rootKey does not exist', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { status } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'somekeyId'
        })

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
    it('derives multiple wallets from a rootKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          count: 3
        })

      expect(body.wallets).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/1",
            address: expect.any(String),
            publicKey: expect.any(String)
          },
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/2",
            address: expect.any(String),
            publicKey: expect.any(String)
          },
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/3",
            address: expect.any(String),
            publicKey: expect.any(String)
          }
        ])
      )
    })
    it('derives wallets from a rootKey and custom derivation paths', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          derivationPaths: ["m/44'/60'/0'/0/4", "m/44'/60'/0'/0/5"]
        })

      expect(body.wallets).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/4",
            address: expect.any(String),
            publicKey: expect.any(String)
          },
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/5",
            address: expect.any(String),
            publicKey: expect.any(String)
          }
        ])
      )
    })
    it('derives a combination of wallets from a rootKey and custom derivation paths', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body: generateKeyResponse } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { keyId } = generateKeyResponse

      const { body } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId,
          count: 2,
          derivationPaths: ["m/44'/60'/0'/0/4", "m/44'/60'/0'/0/5"]
        })

      expect(body.wallets).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/4",
            address: expect.any(String),
            publicKey: expect.any(String)
          },
          {
            id: expect.any(String),
            keyId,
            derivationPath: "m/44'/60'/0'/0/5",
            address: expect.any(String),
            publicKey: expect.any(String)
          }
        ])
      )
    })
  })
})
