import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { Engine } from '../../../../../shared/type/domain.type'
import { EngineRepository } from '../../engine.repository'

describe(EngineRepository.name, () => {
  let repository: EngineRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      providers: [
        KeyValueService,
        EngineRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<EngineRepository>(EngineRepository)
  })

  const engine: Engine = {
    id: 'test-engine-id',
    adminApiKey: 'unsafe-test-admin-api-key',
    masterKey: 'unsafe-test-master-key'
  }

  describe('save', () => {
    it('saves a new engine', async () => {
      await repository.save(engine)

      const value = await inMemoryKeyValueRepository.get(repository.getEngineKey(engine.id))
      const actualEngine = await repository.findById(engine.id)

      expect(value).not.toEqual(null)
      expect(engine).toEqual(actualEngine)
    })
  })
})
