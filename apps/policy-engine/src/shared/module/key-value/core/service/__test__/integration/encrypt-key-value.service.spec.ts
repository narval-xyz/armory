import { ConfigModule } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { load } from '../../../../../../../policy-engine.config'
import { getTestRawAesKeyring } from '../../../../../../../shared/testing/encryption.testing'
import { InMemoryKeyValueRepository } from '../../../../persistence/repository/in-memory-key-value.repository'
import { KeyValueRepository } from '../../../repository/key-value.repository'
import { EncryptKeyValueService } from '../../encrypt-key-value.service'

describe(EncryptKeyValueService.name, () => {
  let service: EncryptKeyValueService
  let keyValueRepository: KeyValueRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        EncryptKeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    service = module.get<EncryptKeyValueService>(EncryptKeyValueService)
    keyValueRepository = module.get<KeyValueRepository>(KeyValueRepository)
  })

  describe('set', () => {
    it('sets encrypt value in the key-value storage', async () => {
      const key = 'test-key'
      const value = 'plain value'

      await service.set(key, value)

      expect(await keyValueRepository.get(key)).not.toEqual(value)
      expect(await service.get(key)).toEqual(value)
    })
  })
})
