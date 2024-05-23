import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import { Test } from '@nestjs/testing'
import { Config, load } from '../../../../../main.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { AppRepository } from '../../../../persistence/repository/app.repository'
import { AppService } from '../../app.service'

describe(AppService.name, () => {
  let appService: AppService
  let configService: ConfigService<Config>

  const app = {
    id: 'test-app-id',
    masterKey: 'test-master-key',
    adminApiKey: secret.hash('test-admin-api-key'),
    activated: true
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        AppService,
        AppRepository,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    appService = module.get<AppService>(AppService)
    configService = module.get<ConfigService<Config>>(ConfigService)
  })

  describe('save', () => {
    it('returns the given secret key', async () => {
      const actualApp = await appService.save(app)

      expect(actualApp.adminApiKey).toEqual(app.adminApiKey)
    })

    // IMPORTANT: The admin API key is hashed by the caller not the service. That
    // allows us to have a determistic configuration file which is useful for
    // automations like development or cloud set up.
    it('does not hash the secret key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(app.id)

      await appService.save(app)

      const actualApp = await appService.getApp()

      expect(actualApp?.adminApiKey).toEqual(app.adminApiKey)
    })
  })
})
