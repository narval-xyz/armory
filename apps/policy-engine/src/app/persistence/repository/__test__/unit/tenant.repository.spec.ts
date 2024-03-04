import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { Tenant } from '../../../../../shared/types/domain.type'
import { TenantRepository } from '../../../repository/tenant.repository'

describe(TenantRepository.name, () => {
  let repository: TenantRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      providers: [
        KeyValueService,
        TenantRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

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
