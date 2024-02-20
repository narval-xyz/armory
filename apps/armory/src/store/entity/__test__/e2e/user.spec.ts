import { Action, Alg, CredentialEntity, Signature, UserEntity, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization } from '@prisma/client/armory'
import request from 'supertest'
import { sha256 } from 'viem'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../armory.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../armory.constant'
import { PolicyEngineModule } from '../../../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { CredentialRepository } from '../../persistence/repository/credential.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

const API_RESOURCE_USER_ENTITY = '/store/users'

describe('User Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let userRepository: UserRepository
  let authCredentialRepository: CredentialRepository

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Evaluation',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

  const user: UserEntity = {
    uid: '68182475-4365-4c4d-a7bd-295daad634c9',
    role: UserRole.MEMBER
  }

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  const credential: CredentialEntity = {
    uid: sha256('0x501d5c2ce1ef208aadf9131a98baa593258cfa06'),
    userId: '68182475-4365-4c4d-a7bd-295daad634c9',
    alg: Alg.ES256K,
    pubKey: '0x501d5c2ce1ef208aadf9131a98baa593258cfa06'
  }

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
    authCredentialRepository = module.get<CredentialRepository>(CredentialRepository)

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
    it('creates user entity with credential', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce,
          user: {
            ...user,
            credential
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      const actualUser = await userRepository.findById(user.uid)
      const actualCredential = await authCredentialRepository.findById(credential.uid)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({ user })

      expect(actualUser).toEqual(user)
      expect(actualCredential).toEqual(credential)
    })

    it('creates user entity without credential', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce,
          user
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      const actualUser = await userRepository.findById(user.uid)
      const actualCredential = await authCredentialRepository.findById(credential.uid)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({ user })

      expect(actualUser).toEqual(user)
      expect(actualCredential).toEqual(null)
    })

    it('responds with error on user entity duplication', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce,
          user
        }
      }

      const { status: firstResponseStatus, body: firstResponseBody } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      const { status: secondResponseStatus, body: secondResponseBody } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(firstResponseBody).toEqual({ user })
      expect(firstResponseStatus).toEqual(HttpStatus.CREATED)

      expect(secondResponseBody).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error'
      })
      expect(secondResponseStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe(`PATCH ${API_RESOURCE_USER_ENTITY}/:uid`, () => {
    it('updates user entity', async () => {
      const create = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce,
          user
        }
      }

      const update = {
        authentication,
        approvals,
        request: {
          action: Action.UPDATE_USER,
          nonce,
          user: {
            ...user,
            role: UserRole.MANAGER
          }
        }
      }

      const { status: createResponseStatus } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(create)

      const { status: updateResponseStatus, body: updateResponseBody } = await request(app.getHttpServer())
        .patch(`${API_RESOURCE_USER_ENTITY}/${user.uid}`)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(update)

      expect(createResponseStatus).toEqual(HttpStatus.CREATED)

      expect(updateResponseBody).toEqual({
        user: {
          uid: user.uid,
          role: update.request.user.role
        }
      })
      expect(updateResponseStatus).toEqual(HttpStatus.OK)
    })
  })
})
