import { load } from '@app/authz/app/app.config'
import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { PersistenceModule } from '@app/authz/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/authz/shared/module/persistence/service/test-prisma.service'
import { Alg } from '@narval/authz-shared'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

describe(AdminRepository.name, () => {
  let module: TestingModule
  let repository: AdminRepository
  let testPrismaService: TestPrismaService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule
      ],
      providers: [AdminRepository]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    repository = module.get<AdminRepository>(AdminRepository)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
  })

  describe('create', () => {
    it('should have test db url', () => {
      // Just leaving this to ensure the jest.setup.ts file is configured correctly to set the env variable.
      const configService = module.get<ConfigService>(ConfigService)
      expect(configService.get('database.url', { infer: true })).toBe('file:./engine-core-test.sqlite')
    })

    it('creates a new organization', async () => {
      await repository.createOrganization('test-org-uid', {
        kid: 'test-kid',
        alg: Alg.ES256K,
        pubKey: 'test-public-key',
        userId: 'test-user-id'
      })

      const org = await testPrismaService.getClient().organization.findFirst({
        where: {
          uid: 'test-org-uid'
        }
      })
      expect(org).toEqual({ uid: 'test-org-uid' })
    })
  })
})
