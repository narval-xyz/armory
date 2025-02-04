import { EncryptionModule } from '@narval/encryption-module'
import { Action, Criterion, EntityStore, FIXTURE, PolicyStore, Then } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { ClientRepository } from '../../../../../client/persistence/repository/client.repository'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { PrismaService } from '../../../../../shared/module/persistence/service/prisma.service'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'

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
        },
        {
          provide: PrismaService,
          useValue: TestPrismaService
        }
      ]
    }).compile()

    repository = module.get<ClientRepository>(ClientRepository)
  })

  describe('saveEntityStore', () => {
    const store: EntityStore = {
      data: FIXTURE.ENTITIES,
      signature: 'test-fake-signature'
    }

    it('saves the entity store', async () => {
      await repository.saveEntityStore(clientId, store)

      expect(await repository.findEntityStore(clientId)).toEqual(store)
    })

    it('overwrites existing entity store', async () => {
      const storeTwo = { ...store, signature: 'another-test-signature' }

      await repository.saveEntityStore(clientId, store)
      await repository.saveEntityStore(clientId, storeTwo)

      expect(await repository.findEntityStore(clientId)).toEqual(storeTwo)
    })
  })

  describe('savePolicyStore', () => {
    const store: PolicyStore = {
      data: [
        {
          id: 'test-permit-policy-uid',
          then: Then.PERMIT,
          description: 'test-policy',
          when: [
            {
              criterion: Criterion.CHECK_ACTION,
              args: [Action.SIGN_TRANSACTION]
            }
          ]
        }
      ],
      signature: 'test-fake-signature'
    }

    it('saves the policy store', async () => {
      await repository.savePolicyStore(clientId, store)

      expect(await repository.findPolicyStore(clientId)).toEqual(store)
    })

    it('overwrites existing policy store', async () => {
      const storeTwo = { ...store, signature: 'another-test-signature' }

      await repository.savePolicyStore(clientId, store)
      await repository.savePolicyStore(clientId, storeTwo)

      expect(await repository.findPolicyStore(clientId)).toEqual(storeTwo)
    })
  })
})
