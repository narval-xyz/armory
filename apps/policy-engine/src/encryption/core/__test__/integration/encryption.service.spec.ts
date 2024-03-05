import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import nock from 'nock'
import { load } from '../../../../policy-engine.config'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { EncryptionRepository } from '../../../persistence/repository/encryption.repository'
import { EncryptionService } from '../../encryption.service'

describe('EncryptionService', () => {
  let module: TestingModule
  let service: EncryptionService
  let testPrismaService: TestPrismaService

  nock.enableNetConnect('kms.us-east-2.amazonaws.com:443')

  beforeEach(async () => {
    // These mocked config values matter; they're specifically tied to the mocked masterKey below
    // If you change these, the decryption won't work & tests will fail
    const configServiceMock = mock<ConfigService>({
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'keyring') {
          return {
            type: 'raw',
            masterPassword: 'unsafe-local-dev-master-password'
          }
        }
        if (key === 'engine.id') {
          return 'local-dev-engine-instance-1'
        }
      })
    })

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule
      ],
      providers: [
        EncryptionService,
        EncryptionRepository,
        {
          provide: ConfigService,
          useValue: configServiceMock // use the mock ConfigService
        }
      ]
    }).compile()

    service = module.get<EncryptionService>(EncryptionService)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    await testPrismaService.truncateAll()

    if (service.setup) {
      await service.setup()
    }
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
  })

  it('should create & encrypt a master key on application bootstrap', async () => {
    await service.setup()

    const engine = await testPrismaService.getClient().engine.findFirst({
      where: {
        id: 'local-dev-engine-instance-1'
      }
    })

    expect(engine?.masterKey).toBeDefined()
  })
})
