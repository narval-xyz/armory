import { DataStoreConfiguration } from '@narval/policy-engine-shared'
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
    await module.get<EncryptionService>(EncryptionService).onApplicationBootstrap()

    repository = module.get<TenantRepository>(TenantRepository)
  })

  describe('create', () => {
    const now = new Date()

    const dataStoreConfiguration: DataStoreConfiguration = {
      dataUrl: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test',
      signatureUrl: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test',
      keys: []
    }

    const tenant: Tenant = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      dataStore: {
        entity: dataStoreConfiguration,
        policy: dataStoreConfiguration
      },
      createdAt: now,
      updatedAt: now
    }

    it('creates a new tenant', async () => {
      await repository.create(tenant)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(tenant.clientId))
      const actualTenant = await repository.findByClientId(tenant.clientId)

      expect(value).not.toEqual(null)
      expect(tenant).toEqual(actualTenant)
    })
  })
})
