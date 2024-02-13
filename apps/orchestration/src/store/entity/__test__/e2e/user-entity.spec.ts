import { Action, Alg, Signature, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization } from '@prisma/client/orchestration'
import request from 'supertest'
import { sha256 } from 'viem'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../orchestration.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../orchestration.constant'
import { PolicyEngineModule } from '../../../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { StoreModule } from '../../../store.module'
import { UserRepository } from '../../persistence/repository/user.repository'

const API_RESOURCE_USER_ENTITY = '/store/users'

describe('User Entity Store', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let userRepository: UserRepository

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Evaluation',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

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
        StoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    userRepository = module.get<UserRepository>(UserRepository)

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
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`POST ${API_RESOURCE_USER_ENTITY}`, () => {
    it('creates user entity', async () => {
      const user = {
        uid: '68182475-4365-4c4d-a7bd-295daad634c9',
        role: UserRole.ADMIN
      }

      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce: 'random-nonce-111',
          user: {
            ...user,
            credential: {
              uid: sha256('0x501d5c2ce1ef208aadf9131a98baa593258cfa06'),
              userId: '68182475-4365-4c4d-a7bd-295daad634c9',
              alg: Alg.ES256K,
              pubKey: '0x501d5c2ce1ef208aadf9131a98baa593258cfa06'
            }
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      const actualUser = await userRepository.findById(user.uid)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({ user })
      expect(actualUser).toEqual({
        ...user,
        orgId: org.id
      })
    })
  })
})
