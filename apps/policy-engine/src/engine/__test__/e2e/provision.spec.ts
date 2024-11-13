import { ConfigModule } from '@narval/config-module'
import { LoggerModule, OpenTelemetryModule, secret } from '@narval/nestjs-shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { Config, load } from '../../../policy-engine.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { EngineService } from '../../core/service/engine.service'
import { ProvisionService } from '../../core/service/provision.service'
import { EngineModule } from '../../engine.module'

const ENDPOINT = '/apps/activate'

const testConfigLoad = (): Config => ({
  ...load(),
  engine: {
    id: 'local-dev-engine-instance-1',
    adminApiKeyHash: undefined
  }
})

describe('Provision', () => {
  let app: INestApplication
  let module: TestingModule
  let engineService: EngineService
  let provisionService: ProvisionService
  let testPrismaService: TestPrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [testConfigLoad],
          isGlobal: true
        }),
        OpenTelemetryModule.forTest(),
        EngineModule
      ]
    }).compile()

    app = module.createNestApplication()

    engineService = app.get(EngineService)
    provisionService = app.get(ProvisionService)
    testPrismaService = app.get(TestPrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await provisionService.provision()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe(`POST ${ENDPOINT}`, () => {
    it('responds with activated app state', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({
        state: 'READY',
        app: {
          appId: 'local-dev-engine-instance-1',
          adminApiKey: expect.any(String)
        }
      })
    })

    it('responds already provisioned', async () => {
      await request(app.getHttpServer()).post(ENDPOINT).send()

      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({ state: 'ACTIVATED' })
    })

    it('does not respond with hashed admin API key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      const actualEngine = await engineService.getEngineOrThrow()

      expect(secret.hash(body.app.adminApiKey)).toEqual(actualEngine.adminApiKey)
    })
  })
})
