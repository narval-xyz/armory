import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'
import { ClientRepository } from '../../../../persistence/repository/client.repository'
import { ClientService } from '../../client.service'

describe(ClientService.name, () => {
  let clientService: ClientService

  const clientId = 'test-client-id'

  const client: Client = {
    clientId,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        ClientService,
        ClientRepository,
        EncryptKeyValueService,
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    clientService = module.get<ClientService>(ClientService)
  })

  describe('save', () => {
    it('saves the client', async () => {
      const actualClient = await clientService.save(client)

      expect(actualClient).toEqual(client)
    })
  })
})
