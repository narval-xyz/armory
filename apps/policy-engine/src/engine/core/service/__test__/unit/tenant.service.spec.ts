import { EncryptionModule } from '@narval/encryption-module'
import { DataStoreConfiguration, FIXTURE } from '@narval/policy-engine-shared'
import { Alg, privateKeyToJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Tenant } from '../../../../../shared/type/domain.type'
import { TenantRepository } from '../../../../persistence/repository/tenant.repository'
import { DataStoreService } from '../../data-store.service'
import { TenantService } from '../../tenant.service'

describe(TenantService.name, () => {
  let tenantService: TenantService
  let tenantRepository: TenantRepository
  let dataStoreServiceMock: MockProxy<DataStoreService>

  const clientId = 'test-client-id'

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
    signer: {
      type: 'PRIVATE_KEY',
      key: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const stores = {
    entity: {
      data: FIXTURE.ENTITIES,
      signature: 'test-signature'
    },
    policy: {
      data: FIXTURE.POLICIES,
      signature: 'test-signature'
    }
  }

  beforeEach(async () => {
    dataStoreServiceMock = mock<DataStoreService>()
    dataStoreServiceMock.fetch.mockResolvedValue(stores)

    const module = await Test.createTestingModule({
      imports: [
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        TenantService,
        TenantRepository,
        EncryptKeyValueService,
        {
          provide: DataStoreService,
          useValue: dataStoreServiceMock
        },
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    tenantService = module.get<TenantService>(TenantService)
    tenantRepository = module.get<TenantRepository>(TenantRepository)
  })

  describe('syncDataStore', () => {
    beforeEach(async () => {
      await tenantRepository.save(tenant)
    })

    it('saves entity and policy stores', async () => {
      expect(await tenantRepository.findEntityStore(clientId)).toEqual(null)
      expect(await tenantRepository.findPolicyStore(clientId)).toEqual(null)

      await tenantService.syncDataStore(clientId)

      expect(await tenantRepository.findEntityStore(clientId)).toEqual(stores.entity)
      expect(await tenantRepository.findPolicyStore(clientId)).toEqual(stores.policy)
    })

    it('fetches the data stores once', async () => {
      await tenantService.syncDataStore(clientId)

      expect(dataStoreServiceMock.fetch).toHaveBeenCalledTimes(1)
      expect(dataStoreServiceMock.fetch).toHaveBeenCalledWith(tenant.dataStore)
    })
  })
})
