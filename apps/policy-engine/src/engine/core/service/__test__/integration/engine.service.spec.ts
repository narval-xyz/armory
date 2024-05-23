import { ConfigModule, ConfigService } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { Test } from '@nestjs/testing'
import { Config, load } from '../../../../../policy-engine.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { EngineRepository } from '../../../../persistence/repository/engine.repository'
import { EngineService } from '../../engine.service'

describe(EngineService.name, () => {
  let service: EngineService
  let configService: ConfigService<Config>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [load] })],
      providers: [
        EngineService,
        EngineRepository,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    service = module.get<EngineService>(EngineService)
    configService = module.get<ConfigService<Config>>(ConfigService)
  })

  describe('save', () => {
    const id = 'test-engine'

    const adminApiKey = secret.hash('test-admin-api-key')

    const engine = {
      id,
      adminApiKey,
      activated: true
    }

    it('returns the given secret key', async () => {
      const actualEngine = await service.save(engine)

      expect(actualEngine.adminApiKey).toEqual(engine.adminApiKey)
    })

    // IMPORTANT: The admin API key is hashed by the caller not the service. That
    // allows us to have a determistic configuration file which is useful for
    // automations like development or cloud set up.
    it('does not hash the admin api key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(id)

      await service.save(engine)

      const actualEngine = await service.getEngine()

      expect(actualEngine?.adminApiKey).toEqual(adminApiKey)
    })
  })
})
