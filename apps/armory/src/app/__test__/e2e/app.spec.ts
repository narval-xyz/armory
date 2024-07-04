import { ConfigModule } from '@narval/config-module'
import { LoggerModule, secret } from '@narval/nestjs-shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { Config, load } from '../../../armory.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { AppModule } from '../../app.module'
import { AppService } from '../../core/service/app.service'

const ENDPOINT = '/apps/activate'

const testConfigLoad = (): Config => ({
  ...load(),
  app: {
    id: 'local-dev-armory-instance-1',
    adminApiKeyHash: undefined
  }
})

describe('App', () => {
  let app: INestApplication
  let module: TestingModule
  let appService: AppService
  let testPrismaService: TestPrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [testConfigLoad],
          isGlobal: true
        }),
        AppModule
      ]
    }).compile()

    app = module.createNestApplication()

    appService = app.get(AppService)
    testPrismaService = app.get(TestPrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe(`POST ${ENDPOINT}`, () => {
    it('responds with generated api key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({
        state: 'READY',
        app: {
          appId: 'local-dev-armory-instance-1',
          adminApiKey: expect.any(String)
        }
      })
    })

    it('responds already activated', async () => {
      await request(app.getHttpServer()).post(ENDPOINT).send()

      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({ state: 'ACTIVATED' })
    })

    it('does not respond with hashed admin api key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      const actualApp = await appService.getAppOrThrow()

      expect(secret.hash(body.app.adminApiKey)).toEqual(actualApp.adminApiKey)
    })
  })
})
