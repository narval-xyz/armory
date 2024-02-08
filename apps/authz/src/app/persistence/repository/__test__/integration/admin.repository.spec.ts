import { Alg, UserRole } from '@narval/authz-shared'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { load } from '../../../../../app/app.config'
import { AdminRepository } from '../../../../../app/persistence/repository/admin.repository'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'

describe(AdminRepository.name, () => {
  let module: TestingModule
  let repository: AdminRepository
  let testPrismaService: TestPrismaService
  let transactionSpy: jest.SpyInstance

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
    transactionSpy = jest.spyOn(testPrismaService.getClient(), '$transaction')
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await transactionSpy.mockRestore()
  })

  describe('setup', () => {
    it('should have test db url', () => {
      // Just leaving this to ensure the jest.setup.ts file is configured correctly to set the env variable.
      const configService = module.get<ConfigService>(ConfigService)
      expect(configService.get('database.url', { infer: true })).toBe('file:./engine-core-test.sqlite')
    })
  })

  describe('createOrganization', () => {
    it('creates a new organization', async () => {
      await repository.createOrganization('test-org-uid', {
        uid: 'test-kid',
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
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })

    it('rolls back org & user creation if rootCredential fails', async () => {
      expect.assertions(2)

      await repository.createOrganization('test-org-uid', {
        uid: 'test-kid',
        alg: Alg.ES256K,
        pubKey: 'test-public-key',
        userId: 'test-user-id'
      })

      // Insert another new Org & new user but same cred.
      const insertAgain = async () =>
        repository.createOrganization('test-org-uid-2', {
          uid: 'test-kid',
          alg: Alg.ES256K,
          pubKey: 'test-public-key',
          userId: 'test-user-id-2'
        })

      expect(insertAgain()).rejects.toThrow()

      const org = await testPrismaService.getClient().organization.findFirst({
        where: {
          uid: 'test-org-uid-2'
        }
      })
      expect(org).toBeNull()
    })
  })

  describe('createUser', () => {
    it('creates a new user without credential', async () => {
      const uid = 'test-uid'
      const role = UserRole.ADMIN
      await repository.createUser(uid, role)

      const user = await testPrismaService.getClient().user.findFirst({
        where: {
          uid
        }
      })

      expect(user).toEqual({ uid, role })
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })

    it('creates a new user with credential', async () => {
      const uid = 'test-uid'
      const role = UserRole.ADMIN
      const credential = {
        uid: 'test-credential-uid',
        pubKey: 'test-public-key',
        alg: Alg.ES256K,
        userId: uid
      }

      await repository.createUser(uid, role, credential)

      const user = await testPrismaService.getClient().user.findFirst({
        where: {
          uid
        }
      })

      const savedCredential = await testPrismaService.getClient().authCredential.findFirst({
        where: {
          uid: credential.uid
        }
      })

      expect(user).toEqual({ uid, role })
      expect(savedCredential).toEqual(credential)
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('assignUserGroup', () => {
    it('should assign user to group', async () => {
      const userId = 'test-user-id'
      const groupId = 'test-group-id'

      await repository.assignUserGroup(userId, groupId)

      const membership = await testPrismaService.getClient().userGroupMembership.findUnique({
        where: {
          userId_userGroupId: {
            userId,
            userGroupId: groupId
          }
        }
      })

      expect(membership).toEqual({
        userId,
        userGroupId: groupId
      })
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })

    it('should create a new userGroup if it does not exist', async () => {
      const userId = 'test-user-id'
      const groupId = 'test-group-id'

      await repository.assignUserGroup(userId, groupId)

      const group = await testPrismaService.getClient().userGroup.findUnique({
        where: {
          uid: groupId
        }
      })

      expect(group).toEqual({
        uid: groupId
      })
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('assignWalletGroup', () => {
    it('should assign wallet to group', async () => {
      const walletId = 'test-wallet-id'
      const groupId = 'test-group-id'

      await repository.assignWalletGroup(walletId, groupId)

      const membership = await testPrismaService.getClient().walletGroupMembership.findUnique({
        where: {
          walletId_walletGroupId: {
            walletId,
            walletGroupId: groupId
          }
        }
      })

      expect(membership).toEqual({
        walletId,
        walletGroupId: groupId
      })
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })

    it('should create a new walletGroup if it does not exist', async () => {
      const walletId = 'test-wallet-id'
      const groupId = 'test-group-id'

      await repository.assignWalletGroup(walletId, groupId)

      const group = await testPrismaService.getClient().walletGroup.findUnique({
        where: {
          uid: groupId
        }
      })

      expect(group).toEqual({
        uid: groupId
      })
      expect(transactionSpy).toHaveBeenCalledTimes(1)
    })
  })
})
