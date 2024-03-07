import {
  Action,
  Criterion,
  DataStoreConfiguration,
  EntityStore,
  FIXTURE,
  PolicyStore,
  Then
} from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { EncryptionService } from '../../../../../encryption/core/encryption.service'
import { EncryptionModule } from '../../../../../encryption/encryption.module'
import { EncryptionRepository } from '../../../../../encryption/persistence/repository/encryption.repository'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { Tenant } from '../../../../../shared/type/domain.type'
import { TenantRepository } from '../../../repository/tenant.repository'

describe(TenantRepository.name, () => {
  let repository: TenantRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  const clientId = 'test-client-id'

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const encryptionRepository = mock<EncryptionRepository>()
    encryptionRepository.getEngine.mockResolvedValue({
      id: 'test-engine',
      masterKey: 'unsafe-test-master-key',
      adminApiKey: 'unsafe-test-api-key'
    })

    const module = await Test.createTestingModule({
      imports: [EncryptionModule],
      providers: [
        KeyValueService,
        TenantRepository,
        {
          provide: EncryptionRepository,
          useValue: encryptionRepository
        },
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    // IMPORTANT: The onApplicationBootstrap performs several side-effects to
    // set up the encryption.
    //
    // TODO: Refactor the encryption service. It MUST be ready for usage given
    // its arguments rather than depending on a set up step.
    await module.get<EncryptionService>(EncryptionService).setup()

    repository = module.get<TenantRepository>(TenantRepository)
  })

  describe('save', () => {
    const now = new Date()

    const dataStoreConfiguration: DataStoreConfiguration = {
      dataUrl: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test',
      signatureUrl: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test',
      keys: []
    }

    const tenant: Tenant = {
      clientId,
      clientSecret: 'test-client-secret',
      dataStore: {
        entity: dataStoreConfiguration,
        policy: dataStoreConfiguration
      },
      createdAt: now,
      updatedAt: now
    }

    it('saves a new tenant', async () => {
      await repository.save(tenant)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(tenant.clientId))
      const actualTenant = await repository.findByClientId(tenant.clientId)

      expect(value).not.toEqual(null)
      expect(tenant).toEqual(actualTenant)
    })

    it('indexes the new tenant', async () => {
      await repository.save(tenant)

      expect(await repository.getTenantIndex()).toEqual([tenant.clientId])
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
          then: Then.PERMIT,
          name: 'test-policy',
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
