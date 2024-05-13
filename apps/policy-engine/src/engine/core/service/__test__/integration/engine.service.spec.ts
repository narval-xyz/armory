import { ConfigModule, ConfigService } from '@narval/config-module'
import { hashSecret } from '@narval/nestjs-shared'
import { Test } from '@nestjs/testing'
import { Config, load } from '../../../../../policy-engine.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { EngineRepository } from '../../../../persistence/repository/engine.repository'
import { EngineService } from '../../engine.service'

describe(EngineService.name, () => {
  let service: EngineService
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository
  let configService: ConfigService<Config>

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [load] })],
      providers: [
        EngineService,
        EngineRepository,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    service = module.get<EngineService>(EngineService)
    configService = module.get<ConfigService<Config>>(ConfigService)
  })

  describe('save', () => {
    it('hashes the admin api key before save', async () => {
      const id = 'test-engien'
      const adminApiKey = 'test-admin-api-key'

      jest.spyOn(configService, 'get').mockReturnValue(id)

      await service.save({
        id,
        adminApiKey,
        activated: true
      })

      const engine = await service.getEngine()

      expect(engine?.adminApiKey).toEqual(hashSecret(adminApiKey))
    })
  })
})
