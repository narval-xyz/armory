import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'
import { ClientRepository } from '../../client.repository'

describe(ClientRepository.name, () => {
  let repository: ClientRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  const clientId = 'test-client-id'

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
        ClientRepository,
        EncryptKeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<ClientRepository>(ClientRepository)
  })

  describe('save', () => {
    const now = new Date()

    const client: Client = {
      clientId,
      createdAt: now,
      updatedAt: now
    }

    it('saves a new client', async () => {
      await repository.save(client)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(client.clientId))
      const actualClient = await repository.findById(client.clientId)

      expect(value).not.toEqual(null)
      expect(client).toEqual(actualClient)
    })

    it('indexes the new client', async () => {
      await repository.save(client)

      expect(await repository.getClientIndex()).toEqual([client.clientId])
    })
  })
})
