import { Test } from '@nestjs/testing'
import { EncryptionModule } from '../../../../../encryption/encryption.module'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { Engine } from '../../../../../shared/types/domain.type'
import { EngineRepository } from '../../engine.repository'

describe(EngineRepository.name, () => {
  let repository: EngineRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [EncryptionModule],
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

  describe('create', () => {
    const engine: Engine = {
      id: 'test-engine-id',
      adminApiKey: 'unsafe-test-admin-api-key',
      masterKey: 'unsafe-test-master-key'
    }

    it('creates a new engine', async () => {
      await repository.create(engine)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(engine.id))
      const actualEngine = await repository.findById(engine.id)

      expect(value).not.toEqual(null)
      expect(engine).toEqual(actualEngine)
    })

    it('throws an error when engine is duplicate', async () => {
      await repository.create(engine)

      await expect(repository.create(engine)).rejects.toThrow(ApplicationException)
    })
  })
})
