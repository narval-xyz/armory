import { EncryptionModule } from '@narval/encryption-module'
import {
  Action,
  Criterion,
  DataStoreConfiguration,
  EntityStore,
  FIXTURE,
  HttpSource,
  PolicyStore,
  SourceType,
  Then
} from '@narval/policy-engine-shared'
import { Alg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { generatePrivateKey } from 'viem/accounts'
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

    const dataStoreSource: HttpSource = {
      type: SourceType.HTTP,
      url: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test'
    }

    const dataStoreConfiguration: DataStoreConfiguration = {
      data: dataStoreSource,
      signature: dataStoreSource,
      keys: [getPublicKey(privateKeyToJwk(generatePrivateKey(), Alg.ES256K))]
    }

    const client: Client = {
      clientId,
      clientSecret: 'test-client-secret',
      signer: {
        privateKey: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
      },
      dataStore: {
        entity: dataStoreConfiguration,
        policy: dataStoreConfiguration
      },
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

      expect(await repository.getClientListIndex()).toEqual([client.clientId])
    })
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
