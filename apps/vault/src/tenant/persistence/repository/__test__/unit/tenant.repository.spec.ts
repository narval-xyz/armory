import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Tenant } from '../../../../../shared/type/domain.type'
import { TenantRepository } from '../../../repository/tenant.repository'

describe(TenantRepository.name, () => {
  let repository: TenantRepository
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
        TenantRepository,
        EncryptKeyValueService,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<TenantRepository>(TenantRepository)
  })

  describe('save', () => {
    const now = new Date()

    const tenant: Tenant = {
      clientId,
      clientSecret: 'test-client-secret',
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
})
