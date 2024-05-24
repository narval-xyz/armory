import { ConfigModule } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../policy-engine.config'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { EngineService } from '../../core/service/engine.service'
import { EngineModule } from '../../engine.module'

const ENDPOINT = '/provision'

describe('Provision', () => {
  let app: INestApplication
  let module: TestingModule
  let engineService: EngineService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        EngineModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useClass(InMemoryKeyValueRepository)
      .compile()

    app = module.createNestApplication()

    engineService = app.get(EngineService)

    await app.init()
  })

  afterAll(async () => {
    await module.close()
    await app.close()
  })

  describe(`POST ${ENDPOINT}`, () => {
    it('responds with activated app state', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      expect(body).toEqual({
        alreadyProvisioned: false,
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

      expect(body).toEqual({ alreadyProvisioned: true })
    })

    it('does not respond with hashed admin API key', async () => {
      const { body } = await request(app.getHttpServer()).post(ENDPOINT).send()

      const engine = await engineService.getEngineOrThrow()

      expect(secret.hash(body.state.adminApiKey)).toEqual(engine.adminApiKey)
    })
  })
})
