import { EncryptionModule } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import { ConfigModule, ConfigService } from '@nestjs/config'
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
  let configService: ConfigService<Config, true>

  const app = {
    id: 'test-app-id',
    masterKey: 'test-master-key',
    adminApiKey: 'test-admin-api-key',
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
    configService = module.get<ConfigService<Config, true>>(ConfigService)
  })

  describe('save', () => {
    it('returns the given secret key', async () => {
      const actualApp = await appService.save(app)

      expect(actualApp.adminApiKey).toEqual(app.adminApiKey)
    })

    it('hashes the secret key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(app.id)

      await appService.save(app)

      const actualApp = await appService.getApp()

      expect(actualApp?.adminApiKey).toEqual(secret.hash(app.adminApiKey))
    })
  })
})
