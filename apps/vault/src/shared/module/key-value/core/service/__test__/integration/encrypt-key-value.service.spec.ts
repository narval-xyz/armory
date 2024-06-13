import { ConfigModule } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { load } from '../../../../../../../main.config'
import { getTestRawAesKeyring } from '../../../../../../../shared/testing/encryption.testing'
import { Collection } from '../../../../../../type/domain.type'
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

      await service.set(key, value, { collection: Collection.ACCOUNT })

      expect(await keyValueRepository.get(key)).not.toEqual(value)
      expect(await service.get(key)).toEqual(value)
    })
  })
  describe('findByClientId', () => {
    it('finds all values for a given collection', async () => {
      const key1 = 'test-key-1'
      const value1 = 'plain value 1'
      const key2 = 'test-key-2'
      const value2 = 'plain value 2'
      const key3 = 'test-key-3'
      const value3 = 'plain value 3'

      await service.set(key1, value1, { collection: Collection.ROOT_KEY })
      await service.set(key2, value2, { collection: Collection.ROOT_KEY })
      await service.set(key3, value3, { collection: Collection.ACCOUNT })

      expect(await service.find({ collection: Collection.ROOT_KEY })).toEqual([value1, value2])
    })

    it('finds all values for a given collenction and clientId', async () => {
      const key1 = 'test-key-1'
      const value1 = 'plain value 1'
      const key2 = 'test-key-2'
      const value2 = 'plain value 2'
      const key3 = 'test-key-3'
      const value3 = 'plain value 3'

      await service.set(key1, value1, { collection: Collection.ROOT_KEY, clientId: 'client-1' })
      await service.set(key2, value2, { collection: Collection.ROOT_KEY, clientId: 'client-2' })
      await service.set(key3, value3, { collection: Collection.ACCOUNT, clientId: 'client-1' })

      expect(await service.find({ collection: Collection.ROOT_KEY, clientId: 'client-1' })).toEqual([value1])
    })
  })
})
