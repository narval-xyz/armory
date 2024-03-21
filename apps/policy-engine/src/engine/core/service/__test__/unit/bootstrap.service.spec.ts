import { EncryptionException, EncryptionService } from '@narval/encryption-module'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { EngineService } from '../../../../../engine/core/service/engine.service'
import { EngineRepository } from '../../../../../engine/persistence/repository/engine.repository'
import { load } from '../../../../../policy-engine.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { BootstrapService } from '../../bootstrap.service'
import { TenantService } from '../../tenant.service'

describe(BootstrapService.name, () => {
  let bootstrapService: BootstrapService
  let tenantServiceMock: MockProxy<TenantService>
  let encryptionServiceMock: MockProxy<EncryptionService>

  const dataStore = {
    entity: {
      dataUrl: 'http://9.9.9.9:90',
      signatureUrl: 'http://9.9.9.9:90',
      keys: []
    },
    policy: {
      dataUrl: 'http://9.9.9.9:90',
      signatureUrl: 'http://9.9.9.9:90',
      keys: []
    }
  }

  const tenantOne = {
    dataStore,
    clientId: 'test-tenant-one-id',
    clientSecret: 'unsafe-client-secret',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const tenantTwo = {
    dataStore,
    clientId: 'test-tenant-two-id',
    clientSecret: 'unsafe-client-secret',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    tenantServiceMock = mock<TenantService>()
    tenantServiceMock.findAll.mockResolvedValue([tenantOne, tenantTwo])

    encryptionServiceMock = mock<EncryptionService>()
    encryptionServiceMock.getKeyring.mockReturnValue(getTestRawAesKeyring())

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        BootstrapService,
        EngineService,
        EngineRepository,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        },
        {
          provide: TenantService,
          useValue: tenantServiceMock
        },
        {
          provide: EncryptionService,
          useValue: encryptionServiceMock
        }
      ]
    }).compile()

    bootstrapService = module.get<BootstrapService>(BootstrapService)
  })

  describe('boot', () => {
    it('syncs tenants data stores', async () => {
      await bootstrapService.boot()

      expect(tenantServiceMock.syncDataStore).toHaveBeenNthCalledWith(1, tenantOne.clientId)
      expect(tenantServiceMock.syncDataStore).toHaveBeenNthCalledWith(2, tenantTwo.clientId)
    })

    it('checks if the encryption keyring is configured', async () => {
      await bootstrapService.boot()

      expect(encryptionServiceMock.getKeyring).toHaveBeenCalledTimes(1)
    })

    it('throws when encryption keyring is not configure', async () => {
      encryptionServiceMock.getKeyring.mockImplementation(() => {
        throw new EncryptionException('Something went wrong')
      })

      await expect(() => bootstrapService.boot()).rejects.toThrow('Something went wrong')
    })
  })
})
