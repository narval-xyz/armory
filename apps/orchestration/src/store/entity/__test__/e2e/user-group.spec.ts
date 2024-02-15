import { Action, Signature, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization } from '@prisma/client/orchestration'
import request from 'supertest'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../orchestration.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../orchestration.constant'
import { PolicyEngineModule } from '../../../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

const API_RESOURCE_USER_ENTITY = '/store/user-groups'

describe('User Group Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let userRepository: UserRepository
  let userGroupRepository: UserGroupRepository

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Evaluation',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

  const user = {
    uid: '68182475-4365-4c4d-a7bd-295daad634c9',
    role: UserRole.MEMBER
  }

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  const groupId = '2a1509ad-ea87-422e-bebd-974547cd4fee'

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        QueueModule.forRoot(),
        PolicyEngineModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    userRepository = module.get<UserRepository>(UserRepository)
    userGroupRepository = module.get<UserGroupRepository>(UserGroupRepository)

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.getClient().organization.create({ data: org })
    await userRepository.create(org.id, user)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`POST ${API_RESOURCE_USER_ENTITY}`, () => {
    it('assigns a user to a group', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.ASSIGN_USER_GROUP,
          nonce,
          data: {
            userId: user.uid,
            groupId
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      const group = await userGroupRepository.findById(groupId)

      expect(body).toEqual({
        data: {
          userId: user.uid,
          groupId
        }
      })

      expect(group).toEqual({
        uid: groupId,
        users: [user.uid]
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
