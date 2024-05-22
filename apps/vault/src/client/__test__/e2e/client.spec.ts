import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { Config, load } from '../../../main.config'
import { REQUEST_HEADER_API_KEY } from '../../../main.constant'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { AppService } from '../../../vault/core/service/app.service'
import { ClientModule } from '../../client.module'
import { CreateClientDto } from '../../http/rest/dto/create-client.dto'
import { ClientRepository } from '../../persistence/repository/client.repository'

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let clientRepository: ClientRepository
  let appService: AppService
  let configService: ConfigService<Config>

  const adminApiKey = 'test-admin-api-key'

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

    app = module.createNestApplication()

    appService = module.get<AppService>(AppService)
    clientRepository = module.get<ClientRepository>(ClientRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    configService = module.get<ConfigService<Config>>(ConfigService)

    await testPrismaService.truncateAll()

    await appService.save({
      id: configService.get('app.id'),
      masterKey: 'test-master-key',
      adminApiKey,
      activated: true
    })

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /clients', () => {
    const clientId = uuid()

    const payload: CreateClientDto = {
      clientId,
      audience: 'https://vault.narval.xyz',
      issuer: 'https://auth.narval.xyz',
      maxTokenAge: 30,
      baseUrl: 'https://vault.narval.xyz'
    }

    it('creates a new client', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(payload)

      const actualClient = await clientRepository.findById(clientId)

      expect(body).toEqual({
        ...actualClient,
        clientSecret: expect.any(String),
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new client with Engine JWK', async () => {
      const newPayload: CreateClientDto = {
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
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(newPayload)

      const actualClient = await clientRepository.findById('client-2')

      expect(body).toEqual({
        ...actualClient,
        clientSecret: expect.any(String),
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer()).post('/clients').set(REQUEST_HEADER_API_KEY, adminApiKey).send(payload)

      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(payload)

      expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(body.message).toEqual('client already exist')
      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it('responds with forbidden when admin api key is invalid', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, 'invalid-api-key')
        .send(payload)

      expect(body).toMatchObject({
        message: 'Forbidden resource',
        statusCode: HttpStatus.FORBIDDEN
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })
  })
})
