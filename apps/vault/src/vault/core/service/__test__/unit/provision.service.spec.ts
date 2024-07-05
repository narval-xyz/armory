import { ConfigService } from '@narval/config-module'
import { LoggerModule, secret } from '@narval/nestjs-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { Config } from '../../../../../main.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { AppRepository } from '../../../../persistence/repository/app.repository'
import { AppService } from '../../app.service'
import { ProvisionService } from '../../provision.service'

const mockConfigService = (config: { keyring: Config['keyring']; engineId: string; adminApiKeyHash?: string }) => {
  const m = mock<ConfigService<Config>>()

  m.get.calledWith('keyring').mockReturnValue(config.keyring)
  m.get.calledWith('app.id').mockReturnValue(config.engineId)
  m.get.calledWith('app.adminApiKeyHash').mockReturnValue(config.adminApiKeyHash)

  return m
}

describe(ProvisionService.name, () => {
  let module: TestingModule
  let provisionService: ProvisionService
  let appService: AppService
  let configServiceMock: MockProxy<ConfigService<Config>>

  const config = {
    engineId: 'test-engine-id',
    keyring: {
      type: 'raw',
      masterPassword: 'test-master-password'
    } satisfies Config['keyring']
  }

  beforeEach(async () => {
    configServiceMock = mockConfigService(config)

    module = await Test.createTestingModule({
      imports: [LoggerModule.forTest()],
      providers: [
        ProvisionService,
        AppService,
        AppRepository,
        KeyValueService,
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    provisionService = module.get(ProvisionService)
    appService = module.get(AppService)
  })

  describe('on first boot', () => {
    describe('when admin api key is set', () => {
      const adminApiKey = 'test-admin-api-key'

      beforeEach(async () => {
        configServiceMock.get.calledWith('app.adminApiKeyHash').mockReturnValue(secret.hash(adminApiKey))
      })

      it('saves the activated app', async () => {
        await provisionService.provision()

        const actualApp = await appService.getApp()

        expect(actualApp).toEqual({
          id: config.engineId,
          adminApiKey: secret.hash(adminApiKey),
          masterKey: expect.any(String)
        })
      })
    })

    describe('when admin api key is not set', () => {
      it('saves the provisioned app', async () => {
        await provisionService.provision()

        const actualApp = await appService.getApp()

        expect(actualApp?.adminApiKey).toEqual(undefined)
        expect(actualApp).toEqual({
          id: config.engineId,
          masterKey: expect.any(String)
        })
      })
    })
  })

  describe('on boot', () => {
    it('skips provision and returns the existing app', async () => {
      const actualApp = await appService.save({
        id: config.engineId,
        masterKey: 'test-master-key'
      })

      const engine = await provisionService.provision()

      expect(actualApp).toEqual(engine)
    })
  })
})
