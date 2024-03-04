import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { EncryptionService } from '../../../../../../../encryption/core/encryption.service'
import { EncryptionModule } from '../../../../../../../encryption/encryption.module'
import { load } from '../../../../../../../policy-engine.config'
import { InMemoryKeyValueRepository } from '../../../../persistence/repository/in-memory-key-value.repository'
import { KeyValueRepository } from '../../../repository/key-value.repository'
import { KeyValueService } from '../../key-value.service'

describe(KeyValueService.name, () => {
  let service: KeyValueService
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
        EncryptionModule
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
    keyValueRepository = module.get<KeyValueRepository>(KeyValueRepository)

    await module.get<EncryptionService>(EncryptionService).onApplicationBootstrap()
  })

  describe('set', () => {
    it('sets encrypted value in the key-value storage', async () => {
      const key = 'test-key'
      const value = 'not encrypted value'

      await service.set(key, value)

      expect(await keyValueRepository.get(key)).not.toEqual(value)
      expect(await service.get(key)).toEqual(value)
    })
  })
})
