import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { NonceService } from '../../nonce.service'

describe(NonceService.name, () => {
  let service: NonceService
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  const clientId = 'test-client-id'

  const nonce = 'test-nonce'

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      providers: [
        NonceService,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    service = module.get<NonceService>(NonceService)
  })

  describe('save', () => {
    it('saves nonce per client', async () => {
      await service.save(clientId, nonce)

      expect(await inMemoryKeyValueRepository.get(`request-nonce:${clientId}:${nonce}`)).toEqual('1')
    })
  })

  describe('exist', () => {
    it('returns true when nonce exist', async () => {
      await service.save(clientId, nonce)

      expect(await service.exist(clientId, nonce)).toEqual(true)
    })

    it('returns false when nonce does not exist', async () => {
      expect(await service.exist(clientId, nonce)).toEqual(false)
    })
  })
})
