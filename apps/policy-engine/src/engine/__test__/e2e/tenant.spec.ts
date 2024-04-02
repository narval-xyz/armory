import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import {
  PrivateKey,
  privateKeyToHex,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'
import { EngineService } from '../../../engine/core/service/engine.service'
import { Config, load } from '../../../policy-engine.config'
import {
  REQUEST_HEADER_API_KEY,
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET
} from '../../../policy-engine.constant'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Tenant } from '../../../shared/type/domain.type'
import { TenantService } from '../../core/service/tenant.service'
import { EngineModule } from '../../engine.module'
import { CreateTenantDto } from '../../http/rest/dto/create-tenant.dto'
import { TenantRepository } from '../../persistence/repository/tenant.repository'

describe('Tenant', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let tenantRepository: TenantRepository
  let tenantService: TenantService
  let engineService: EngineService
  let configService: ConfigService<Config>
  let dataStoreConfiguration: DataStoreConfiguration
  let createTenantPayload: CreateTenantDto

  const adminApiKey = 'test-admin-api-key'

  const clientId = uuid()

  const dataStoreUrl = 'http://127.0.0.1:9999/test-data-store'

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        EngineModule
      ]
    })
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()

    engineService = module.get<EngineService>(EngineService)
    tenantService = module.get<TenantService>(TenantService)
    tenantRepository = module.get<TenantRepository>(TenantRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    configService = module.get<ConfigService<Config>>(ConfigService)

    const jwk = secp256k1PrivateKeyToJwk(generatePrivateKey())

    dataStoreConfiguration = {
      dataUrl: dataStoreUrl,
      signatureUrl: dataStoreUrl,
      keys: [jwk]
    }

    createTenantPayload = {
      clientId,
      entityDataStore: dataStoreConfiguration,
      policyDataStore: dataStoreConfiguration
    }

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await engineService.save({
      id: configService.get('engine.id'),
      masterKey: 'unsafe-test-master-key',
      adminApiKey
    })

    jest.spyOn(tenantService, 'syncDataStore').mockResolvedValue(true)
  })

  describe('POST /tenants', () => {
    it('creates a new tenant', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createTenantPayload)

      const actualTenant = await tenantRepository.findByClientId(clientId)
      const actualPublicKey = secp256k1PrivateKeyToPublicJwk(privateKeyToHex(actualTenant?.signer.key as PrivateKey))

      expect(body).toEqual({
        ...actualTenant,
        signer: { publicKey: actualPublicKey },
        createdAt: actualTenant?.createdAt.toISOString(),
        updatedAt: actualTenant?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('does not expose the signer private key', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createTenantPayload)

      expect(body.signer.key).not.toBeDefined()
      expect(body.signer.type).not.toBeDefined()
      // The JWK private key is stored in the key's `d` property.
      // See also https://datatracker.ietf.org/doc/html/rfc7517#appendix-A.2
      expect(body.signer.publicKey.d).not.toBeDefined()
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createTenantPayload)

      const { status, body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createTenantPayload)

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
        .send(createTenantPayload)

      expect(body).toMatchObject({
        message: 'Forbidden resource',
        statusCode: HttpStatus.FORBIDDEN
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })
  })

  describe('POST /tenants/sync', () => {
    let tenant: Tenant

    beforeEach(async () => {
      jest.spyOn(tenantService, 'syncDataStore').mockResolvedValue(true)

      const { body } = await request(app.getHttpServer())
        .post('/tenants')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({
          ...createTenantPayload,
          clientId: uuid()
        })

      tenant = body
    })

    it('calls the tenant data store sync', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/tenants/sync')
        .set(REQUEST_HEADER_CLIENT_ID, tenant.clientId)
        .set(REQUEST_HEADER_CLIENT_SECRET, tenant.clientSecret)
        .send(createTenantPayload)

      expect(body).toEqual({ ok: true })
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
