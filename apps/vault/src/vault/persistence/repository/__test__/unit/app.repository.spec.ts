import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { App } from '../../../../../shared/type/domain.type'
import { AppRepository } from '../../app.repository'

describe(AppRepository.name, () => {
  let repository: AppRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        KeyValueService,
        AppRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<AppRepository>(AppRepository)
  })

  describe('save', () => {
    const app: App = {
      id: 'test-app-id',
      adminApiKey: 'unsafe-test-admin-api-key',
      masterKey: 'unsafe-test-master-key'
    }

    it('saves a new app', async () => {
      await repository.save(app)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(app.id))
      const actualApp = await repository.findById(app.id)

      expect(value).not.toEqual(null)
      expect(app).toEqual(actualApp)
    })
  })
})
