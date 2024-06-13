import { ConfigModule } from '@narval/config-module'
import { Test } from '@nestjs/testing'
import { load } from '../../../../../../../main.config'
import { Collection } from '../../../../../../../shared/type/domain.type'
import { InMemoryKeyValueRepository } from '../../../../persistence/repository/in-memory-key-value.repository'
import { KeyValueRepository } from '../../../repository/key-value.repository'
import { KeyValueService } from '../../key-value.service'

describe(KeyValueService.name, () => {
  let service: KeyValueService
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        KeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    service = module.get<KeyValueService>(KeyValueService)
  })

  describe('set', () => {
    it('sets dencrypted value in the key-value storage', async () => {
      const key = 'test-key'
      const value = 'plain value'

      await service.set(key, value, { collection: Collection.ROOT_KEY })

      expect(await service.get(key)).toEqual(value)
    })
  })

  describe('findByClientId', () => {
    it('returns all values for a given collection', async () => {
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
