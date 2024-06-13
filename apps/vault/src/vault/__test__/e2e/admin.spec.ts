import { GenerateEncryptionKeyResponse, Origin, Permission } from '@narval/armory-sdk'
import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import {
  Payload,
  SigningAlg,
  buildSignerEip191,
  rsaEncrypt,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  signJwt
} from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { english, generateMnemonic } from 'viem/accounts'
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

  describe('GET wallets', () => {
    it('list all wallets for a specific client', async () => {
      const secondClientId = uuid()
      await clientService.save({
        clientId: secondClientId,
        engineJwk: clientPublicJWK,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const accessToken = await getAccessToken([Permission.WALLET_READ])
      const { body: firstMnemonicRequest } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { body: secondMnemonicRequest } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-2'
        })

      const { body: firstDeriveRequest } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId',
          derivationPaths: ['next']
        })

      const { body: secondDeriveRequest } = await request(app.getHttpServer())
        .post('/derive/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-2',
          derivationPaths: ['next']
        })

      const wallets = [
        firstMnemonicRequest.wallet,
        secondMnemonicRequest.wallet,
        firstDeriveRequest.wallets,
        secondDeriveRequest.wallets
      ]

      await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-second-client'
        })

      const { body } = await request(app.getHttpServer())
        .get('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      expect(body).toEqual({ wallets })
    })
  })

  describe('GET seeds', () => {
    it('list all seeds by client', async () => {
      const secondClientId = uuid()
      await clientService.save({
        clientId: secondClientId,
        engineJwk: clientPublicJWK,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const accessToken = await getAccessToken([Permission.WALLET_READ, Permission.WALLET_IMPORT])

      const response = await request(app.getHttpServer())
        .post('/import/encryption-keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      const { publicKey: firstClientPublicKey } = GenerateEncryptionKeyResponse.parse(response.body)

      const secondResponse = await request(app.getHttpServer())
        .post('/import/encryption-keys')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      const { publicKey: secondClientPublicKey } = GenerateEncryptionKeyResponse.parse(secondResponse.body)

      const { body: firstMnemonicRequest } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { body: secondMnemonicRequest } = await request(app.getHttpServer())
        .post('/generate/keys')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-2'
        })

      const firstGeneratedSeed = generateMnemonic(english)
      const firstEncryptedSeed = await rsaEncrypt(firstGeneratedSeed, firstClientPublicKey)
      const { body: firstImportRequest } = await request(app.getHttpServer())
        .post('/import/seeds')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-imported-1',
          encryptedSeed: firstEncryptedSeed
        })

      const secondGeneratedSeed = generateMnemonic(english)
      const secondEncryptedSeed = await rsaEncrypt(secondGeneratedSeed, secondClientPublicKey)

      const { body: secondImportRequest } = await request(app.getHttpServer())
        .post('/import/seeds')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId-imported-2',
          encryptedSeed: secondEncryptedSeed
        })

      const expectedFirstClientSeeds = [
        {
          keyId: firstMnemonicRequest.keyId,
          origin: Origin.GENERATED
        },
        {
          keyId: firstImportRequest.keyId,
          origin: Origin.IMPORTED
        }
      ]

      const expectedSecondClientSeeds = [
        {
          keyId: secondMnemonicRequest.keyId,
          origin: Origin.GENERATED
        },
        {
          keyId: secondImportRequest.keyId,
          origin: Origin.IMPORTED
        }
      ]

      const { body: firstClientGetRequest } = await request(app.getHttpServer())
        .get('/seeds')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      const { body: secondClientGetRequest } = await request(app.getHttpServer())
        .get('/seeds')
        .set(REQUEST_HEADER_CLIENT_ID, secondClientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      expect(firstClientGetRequest).toEqual({ seeds: expectedFirstClientSeeds })
      expect(secondClientGetRequest).toEqual({ seeds: expectedSecondClientSeeds })
    })
  })
})
