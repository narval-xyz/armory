import { ConfigModule, ConfigService } from '@narval/config-module'
import { LoggerModule, LoggerService, NullLoggerService, secret } from '@narval/nestjs-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { get } from 'lodash/fp'
import { Config, load } from '../../../../../armory.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { AppRepository } from '../../../../persistence/repository/app.repository'
import { AlreadyActivatedException } from '../../../exception/app-already-activated.exception'
import { AppService } from '../../app.service'

const mockConfig = (config: { appId: string; adminApiKeyHash?: string }) => (key: string) => {
  if (key === 'app.id') {
    return config.appId
  }

  if (key === 'app.adminApiKeyHash') {
    return config.adminApiKeyHash
  }

  return get(key, config)
}

describe(AppService.name, () => {
  let module: TestingModule
  let appService: AppService
  let testPrismaService: TestPrismaService
  let configServiceMock: MockProxy<ConfigService<Config>>

  const config = { appId: 'test-app-id' }

  const adminApiKey = 'test-admin-api-key'

  beforeEach(async () => {
    configServiceMock = mock<ConfigService<Config>>()
    configServiceMock.get.mockImplementation(mockConfig(config))

    module = await Test.createTestingModule({
      imports: [
        // Satisfy the PersistenceModule dependency in a global ConfigService.
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        LoggerModule
      ],
      providers: [
        AppService,
        AppRepository,
        {
          // Mock the ConfigService to control the behavior of the application.
          provide: ConfigService,
          useValue: configServiceMock
        },
        {
          provide: LoggerService,
          useClass: NullLoggerService
        }
      ]
    }).compile()

    appService = module.get(AppService)
    testPrismaService = module.get(TestPrismaService)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('provision', () => {
    describe('on first boot', () => {
      describe('when admin api key is set', () => {
        beforeEach(async () => {
          configServiceMock.get.mockImplementation(
            mockConfig({
              ...config,
              adminApiKeyHash: secret.hash(adminApiKey)
            })
          )
        })

        it('saves app with hashed admin api key', async () => {
          await appService.provision()

          const actualApp = await appService.getApp()

          expect(actualApp).toEqual({
            id: config.appId,
            adminApiKey: secret.hash(adminApiKey)
          })
        })

        it('returns the hashed admin api key', async () => {
          const app = await appService.provision()

          expect(app?.adminApiKey).toEqual(secret.hash(adminApiKey))
        })

        it('uses given admin api key', async () => {
          const givenAdminApiKey = secret.hash('test-given-admin-api-key')

          await appService.provision(givenAdminApiKey)

          const actualApp = await appService.getApp()

          expect(actualApp).toEqual({
            id: config.appId,
            adminApiKey: givenAdminApiKey
          })
        })
      })

      describe('when admin api key is not set', () => {
        it('saves app without admin api key', async () => {
          await appService.provision()

          const actualApp = await appService.getApp()

          expect(actualApp).toEqual({ id: config.appId })
        })
      })
    })

    describe('on boot', () => {
      it('skips provision and returns the existing app', async () => {
        const actualApp = await appService.save({ id: config.appId })

        const app = await appService.provision()

        expect(actualApp).toEqual(app)
      })
    })
  })

  describe('activate', () => {
    describe('when admin api key is set', () => {
      beforeEach(async () => {
        configServiceMock.get.mockImplementation(
          mockConfig({
            ...config,
            adminApiKeyHash: adminApiKey
          })
        )
      })

      it('returns app is activated when admin api key is set', async () => {
        await appService.provision()

        await expect(appService.activate(adminApiKey)).rejects.toThrow(AlreadyActivatedException)
      })
    })

    describe('when admin api key is not set', () => {
      beforeEach(async () => {
        await appService.provision()
      })

      it('returns the plain text admin api key', async () => {
        const result = await appService.activate(adminApiKey)

        expect(result).toEqual({
          id: config.appId,
          adminApiKey
        })
      })

      it('hashes the new admin api key', async () => {
        await appService.activate(adminApiKey)

        const actualApp = await appService.getApp()

        expect(actualApp?.adminApiKey).toEqual(secret.hash(adminApiKey))
      })
    })
  })
})
