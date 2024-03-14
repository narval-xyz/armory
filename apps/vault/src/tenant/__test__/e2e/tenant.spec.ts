import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { Config, load } from '../../../main.config'
import { REQUEST_HEADER_API_KEY } from '../../../main.constant'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { CreateTenantDto } from '../../../tenant/http/rest/dto/create-tenant.dto'
import { AppService } from '../../../vault/core/service/app.service'
import { TenantRepository } from '../../persistence/repository/tenant.repository'
import { TenantModule } from '../../tenant.module'

describe('Tenant', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let tenantRepository: TenantRepository
  let appService: AppService
  let configService: ConfigService<Config, true>

  const adminApiKey = 'test-admin-api-key'

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
      .compile()

    app = module.createNestApplication()

    appService = module.get<AppService>(AppService)
    tenantRepository = module.get<TenantRepository>(TenantRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    configService = module.get<ConfigService<Config, true>>(ConfigService)

    await testPrismaService.truncateAll()

    await appService.save({
      id: configService.get('app.id', { infer: true }),
      masterKey: 'unsafe-test-master-key',
      adminApiKey
    })

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /tenants', () => {
    const clientId = uuid()

    const payload: CreateTenantDto = {
      clientId
    }

    it('creates a new tenant', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(payload)
      const actualTenant = await tenantRepository.findByClientId(clientId)

      expect(body).toMatchObject({
        clientId,
        clientSecret: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(body).toEqual({
        ...actualTenant,
        createdAt: actualTenant?.createdAt.toISOString(),
        updatedAt: actualTenant?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer()).post('/tenants').set(REQUEST_HEADER_API_KEY, adminApiKey).send(payload)

      const { status, body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(payload)

      expect(body).toEqual({
        message: 'Tenant already exist',
        statusCode: HttpStatus.BAD_REQUEST
      })
      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it('responds with forbidden when admin api key is invalid', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/tenants')
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
