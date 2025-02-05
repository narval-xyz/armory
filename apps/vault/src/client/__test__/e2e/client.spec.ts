import { REQUEST_HEADER_ADMIN_API_KEY } from '@narval/nestjs-shared'
import {
  Alg,
  SMALLEST_RSA_MODULUS_LENGTH,
  generateJwk,
  rsaPublicKeySchema,
  secp256k1PublicKeySchema
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { VaultTest } from '../../../__test__/shared/vault.test'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { ClientRepository } from '../../persistence/repository/client.repository'

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let clientRepository: ClientRepository
  let provisionService: ProvisionService

  const adminApiKey = 'test-vault-admin-api-key'

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    provisionService = module.get<ProvisionService>(ProvisionService)
    clientRepository = module.get<ClientRepository>(ClientRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    await testPrismaService.truncateAll()

    await provisionService.provision()
    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /clients', () => {
    const clientId = uuid()

    const payload = {
      clientId,
      audience: 'https://vault.narval.xyz',
      issuer: 'https://auth.narval.xyz',
      maxTokenAge: 30,
      baseUrl: 'https://vault.narval.xyz'
    }

    it('creates a new client', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(payload)

      const actualClient = await clientRepository.findById(clientId)

      expect(body).toEqual({
        ...actualClient,
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new client with Engine JWK', async () => {
      const newPayload = {
        clientId: 'client-2',
        engineJwk: {
          kty: 'EC',
          crv: 'secp256k1',
          alg: 'ES256K',
          kid: '0x73d3ed0e92ac09a45d9538980214abb1a36c4943d64ffa53a407683ddf567fc9',
          x: 'sxT67JN5KJVnWYyy7xhFNUOk4buvPLrbElHBinuFwmY',
          y: 'CzC7IHlsDg9wz-Gqhtc78eC0IEX75upMgrvmS3U6Ad4'
        }
      }
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(newPayload)

      const actualClient = await clientRepository.findById('client-2')

      expect(body).toEqual({
        ...actualClient,
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer()).post('/clients').set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey).send(payload)

      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(payload)

      expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(body.message).toEqual('Client already exist')
      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it('responds with forbidden when admin api key is invalid', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, 'invalid-api-key')
        .send(payload)

      expect(body).toMatchObject({
        message: 'Forbidden resource',
        statusCode: HttpStatus.FORBIDDEN
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })

    it('creates a new client with RSA backup public key', async () => {
      const rsaBackupKey = rsaPublicKeySchema.parse(
        await generateJwk(Alg.RS256, {
          modulusLength: SMALLEST_RSA_MODULUS_LENGTH,
          keyId: 'rsaBackupKeyId'
        })
      )

      const validClientPayload = {
        ...payload,
        clientId: uuid(),
        backupPublicKey: rsaBackupKey
      }

      const { status: rightKeyStatus } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(validClientPayload)

      expect(rightKeyStatus).toEqual(HttpStatus.CREATED)
    })

    it('responds with unprocessable entity when backup key is not an RSA key', async () => {
      const secpBackupKey = secp256k1PublicKeySchema.parse(await generateJwk(Alg.ES256K, { keyId: 'secpBackupKeyId' }))

      const invalidClientPayload = {
        ...payload,
        clientId: uuid(),
        backupPublicKey: secpBackupKey
      }

      const { status: wrongKeyStatus } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(invalidClientPayload)

      expect(wrongKeyStatus).toEqual(HttpStatus.UNPROCESSABLE_ENTITY)
    })

    it('creates a new client with token validation disabled & pinned user', async () => {
      const newPayload = {
        clientId: 'client-3',
        name: 'Client 3',
        auth: {
          local: {
            allowedUsers: [
              {
                userId: 'user-1',
                publicKey: {
                  kty: 'EC',
                  crv: 'secp256k1',
                  alg: 'ES256K',
                  kid: '0x73d3ed0e92ac09a45d9538980214abb1a36c4943d64ffa53a407683ddf567fc9',
                  x: 'sxT67JN5KJVnWYyy7xhFNUOk4buvPLrbElHBinuFwmY',
                  y: 'CzC7IHlsDg9wz-Gqhtc78eC0IEX75upMgrvmS3U6Ad4'
                }
              }
            ]
          },
          tokenValidation: {
            disabled: true
          }
        }
      }
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(newPayload)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({
        clientId: newPayload.clientId,
        name: newPayload.name,
        baseUrl: null,
        backupPublicKey: null,
        configurationSource: 'dynamic',
        auth: {
          disabled: false,
          local: {
            jwsd: {
              maxAge: 300,
              requiredComponents: ['htm', 'uri', 'created', 'ath']
            },
            allowedUsersJwksUrl: null,
            allowedUsers: newPayload.auth.local.allowedUsers
          },
          tokenValidation: {
            disabled: true,
            url: null,
            jwksUrl: null,
            pinnedPublicKey: null,
            verification: {
              audience: null,
              issuer: null,
              maxTokenAge: null,
              requireBoundTokens: true,
              allowBearerTokens: false,
              allowWildcard: null
            }
          }
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })
})
