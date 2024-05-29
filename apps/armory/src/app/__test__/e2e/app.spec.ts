import { ConfigModule } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../armory.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { AppModule } from '../../app.module'
import { AppService } from '../../core/service/app.service'

const ENDPOINT = '/provision'

describe('Provision', () => {
  let app: INestApplication
  let module: TestingModule
  let appService: AppService
  let testPrismaService: TestPrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
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
    it('responds with activated app', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({
        isActivated: false,
        state: {
          appId: 'local-dev-armory-instance-1',
          adminApiKey: expect.any(String)
        }
      })
    })

    it('responds already provisioned', async () => {
      await request(app.getHttpServer()).post(ENDPOINT).send()

      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({ isActivated: true })
    })

    it('does not respond with hashed admin API key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      const actualApp = await appService.getAppOrThrow()

      expect(secret.hash(body.state.adminApiKey)).toEqual(actualApp.adminApiKey)
    })
  })
})
