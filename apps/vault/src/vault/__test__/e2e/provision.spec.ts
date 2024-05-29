import { ConfigModule } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { AppService } from '../../core/service/app.service'
import { VaultModule } from '../../vault.module'

const ENDPOINT = '/provision'

describe('Provision', () => {
  let app: INestApplication
  let module: TestingModule
  let engineService: AppService
  let testPrismaService: TestPrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        VaultModule
      ]
    }).compile()

    app = module.createNestApplication()

    engineService = app.get(AppService)
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
    it('responds with activated app state', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({
        isProvisioned: false,
        state: {
          appId: 'local-dev-engine-instance-1',
          adminApiKey: expect.any(String),
          encryptionType: 'raw',
          isMasterPasswordSet: true,
          isMasterKeySet: true
        }
      })
    })

    it('responds already provisioned', async () => {
      await request(app.getHttpServer()).post(ENDPOINT).send()

      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({ isProvisioned: true })
    })

    it('does not respond with hashed admin API key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      const engine = await engineService.getAppOrThrow()

      expect(secret.hash(body.state.adminApiKey)).toEqual(engine.adminApiKey)
    })
  })
})
