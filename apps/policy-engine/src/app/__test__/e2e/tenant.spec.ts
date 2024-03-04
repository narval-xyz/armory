import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { AppModule } from '../../../app/app.module'
import { load } from '../../../policy-engine.config'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { CreateTenantDto } from '../../http/rest/dto/create-tenant.dto'
import { TenantRepository } from '../../persistence/repository/tenant.repository'

describe('Tenant', () => {
  let app: INestApplication
  let module: TestingModule
  let tenantRepository: TenantRepository

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        AppModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .compile()

    app = module.createNestApplication()

    tenantRepository = module.get<TenantRepository>(TenantRepository)

    await app.init()
  })

  afterAll(async () => {
    await module.close()
    await app.close()
  })

  describe('POST /tenants', () => {
    const clientId = uuid()

    const dataStoreConfiguration = {
      dataUrl: 'http://some.host',
      signatureUrl: 'http://some.host'
    }

    const payload: CreateTenantDto = {
      clientId,
      entityDataStore: dataStoreConfiguration,
      policyDataStore: dataStoreConfiguration
    }

    it('creates a new tenant', async () => {
      const { status, body } = await request(app.getHttpServer()).post('/tenants').send(payload)
      const actualTenant = await tenantRepository.findByClientId(clientId)

      expect(body).toMatchObject({
        clientId,
        clientSecret: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        dataStore: {
          policy: {
            ...dataStoreConfiguration,
            keys: []
          },
          entity: {
            ...dataStoreConfiguration,
            keys: []
          }
        }
      })
      expect(body).toEqual({
        ...actualTenant,
        createdAt: actualTenant?.createdAt.toISOString(),
        updatedAt: actualTenant?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer()).post('/tenants').send(payload)
      const { status, body } = await request(app.getHttpServer()).post('/tenants').send(payload)

      expect(body).toEqual({
        message: 'Tenant already exist',
        statusCode: HttpStatus.BAD_REQUEST
      })
      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })
  })
})
