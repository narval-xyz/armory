import { ConfigService } from '@narval/config-module'
import { LoggerModule, secret } from '@narval/nestjs-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { AppService } from '../../../../../app.service'
import { Config } from '../../../../../main.config'
import { ProvisionService } from '../../../../../provision.service'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { ProvisionException } from '../../../exception/provision.exception'

const mockConfigService = (config: { keyring: Config['keyring']; engineId: string; adminApiKeyHash?: string }) => {
  const m = mock<ConfigService<Config>>()

  m.get.calledWith('keyring').mockReturnValue(config.keyring)
  m.get.calledWith('app.id').mockReturnValue(config.engineId)
  m.get
    .calledWith('app.auth.local')
    .mockReturnValue(config.adminApiKeyHash ? { adminApiKeyHash: config.adminApiKeyHash } : null)

  return m
}

describe(ProvisionService.name, () => {
  let module: TestingModule
  let provisionService: ProvisionService
  let appServiceMock: MockProxy<AppService>
  let configServiceMock: MockProxy<ConfigService<Config>>

  const config = {
    engineId: 'test-engine-id',
    keyring: {
      type: 'raw',
      encryptionMasterPassword: 'test-master-password',
      encryptionMasterKey: null,
      hmacSecret: 'test-hmac-secret'
    } satisfies Config['keyring']
  }

  beforeEach(async () => {
    configServiceMock = mockConfigService(config)
    appServiceMock = mock<AppService>()

    module = await Test.createTestingModule({
      imports: [LoggerModule.forTest()],
      providers: [
        ProvisionService,
        {
          provide: AppService,
          useValue: appServiceMock
        },
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
  })

  describe('on first boot', () => {
    describe('when admin api key is set', () => {
      const adminApiKey = 'test-admin-api-key'

      beforeEach(async () => {
        configServiceMock.get
          .calledWith('app.auth.local')
          .mockReturnValue({ adminApiKeyHash: secret.hash(adminApiKey) })
        appServiceMock.getApp.mockResolvedValue(null)
      })

      it('saves the activated app', async () => {
        await provisionService.provision()

        expect(appServiceMock.save).toHaveBeenCalledWith({
          id: config.engineId,
          encryptionKeyringType: 'raw',
          encryptionMasterKey: expect.any(String),
          encryptionMasterAwsKmsArn: undefined,
          adminApiKeyHash: secret.hash(adminApiKey),
          authDisabled: undefined
        })
      })
    })

    describe('when admin api key is not set', () => {
      it('saves the provisioned app', async () => {
        await provisionService.provision()

        expect(appServiceMock.save).toHaveBeenCalledWith({
          id: config.engineId,
          encryptionKeyringType: 'raw',
          encryptionMasterKey: expect.any(String),
          encryptionMasterAwsKmsArn: undefined,
          adminApiKeyHash: null,
          authDisabled: undefined
        })
      })
    })
  })

  describe('on boot', () => {
    it('fails when masterEncryptionKey is not valid', async () => {
      await appServiceMock.getApp.mockResolvedValue({
        id: config.engineId,
        encryptionMasterKey: 'test-master-key',
        encryptionKeyringType: 'raw',
        encryptionMasterAwsKmsArn: null,
        authDisabled: false
      })

      await expect(provisionService.provision()).rejects.toThrow(ProvisionException)
    })
  })
})
