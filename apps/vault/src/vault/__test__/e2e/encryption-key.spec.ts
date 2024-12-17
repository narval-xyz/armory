import { Permission } from '@narval/armory-sdk'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import {
  Payload,
  SigningAlg,
  buildSignerEip191,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  signJwt
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client } from '../../../shared/type/domain.type'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Encryption-keys', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

  const clientId = uuid()

  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
    auth: {
      disabled: false,
      local: {
        jwsd: {
          maxAge: 600,
          requiredComponents: ['htm', 'uri', 'created', 'ath']
        },
        allowedUsersJwksUrl: null,
        allowedUsers: null
      },
      tokenValidation: {
        disabled: false,
        url: null,
        jwksUrl: null,
        verification: {
          audience: null,
          issuer: 'https://armory.narval.xyz',
          maxTokenAge: 300,
          requireBoundTokens: false, // DO NOT REQUIRE BOUND TOKENS; we're testing both payload.cnf bound tokens and unbound here.
          allowBearerTokens: false,
          allowWildcard: [
            'path.to.allow',
            'transactionRequest.maxFeePerGas',
            'transactionRequest.maxPriorityFeePerGas',
            'transactionRequest.gas'
          ]
        },
        pinnedPublicKey: clientPublicJWK
      }
    },
    name: 'test-client',
    configurationSource: 'dynamic',
    backupPublicKey: null,
    baseUrl: null,
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
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication({ logger: false })

    provisionService = module.get<ProvisionService>(ProvisionService)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    clientService = module.get<ClientService>(ClientService)

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await provisionService.provision()

    await clientService.save(client)
  })

  describe('POST', () => {
    it('responds with unauthorized when client secret is missing', async () => {
      const { status } = await request(app.getHttpServer()).post('/encryption-keys').send()

      expect(status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    it('generates an RSA keypair', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_IMPORT])

      const { status, body } = await request(app.getHttpServer())
        .post('/encryption-keys')
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
})
