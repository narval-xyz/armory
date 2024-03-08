import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { BootstrapService } from '../../bootstrap.service'
import { TenantService } from '../../tenant.service'

describe(BootstrapService.name, () => {
  let bootstrapService: BootstrapService
  let tenantServiceMock: MockProxy<TenantService>

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

    const module = await Test.createTestingModule({
      providers: [
        BootstrapService,
        {
          provide: TenantService,
          useValue: tenantServiceMock
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
  })
})
