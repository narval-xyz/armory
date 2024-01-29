import { load } from '@app/authz/app/app.config'
import { OrganizationRepository } from '@app/authz/app/persistence/repository/organization.repository'
import { PersistenceModule } from '@app/authz/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/authz/shared/module/persistence/service/test-prisma.service'
import { Alg } from '@narval/authz-shared'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

describe(OrganizationRepository.name, () => {
  let module: TestingModule
  let repository: OrganizationRepository
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
      providers: [OrganizationRepository]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    repository = module.get<OrganizationRepository>(OrganizationRepository)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
  })

  describe('create', () => {
    it('creates a new organization', async () => {
      await repository.createOrganization('test-org-uid', 'test-user-uid', {
        alg: Alg.ES256K,
        pubKey: 'test-public-key'
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
