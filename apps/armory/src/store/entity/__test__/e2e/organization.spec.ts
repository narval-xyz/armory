import { Action, Alg, CredentialEntity, OrganizationEntity, Signature, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { sha256 } from 'viem'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../armory.config'
import { OrchestrationModule } from '../../../../orchestration/orchestration.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { CredentialRepository } from '../../persistence/repository/credential.repository'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

const API_RESOURCE_USER_ENTITY = '/store/organizations'

describe('Organization Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let orgRepository: OrganizationRepository
  let userRepository: UserRepository
  let authCredentialRepository: CredentialRepository

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

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
        OrchestrationModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository)
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

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`POST ${API_RESOURCE_USER_ENTITY}`, () => {
    it('creates organization and root user', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_ORGANIZATION,
          nonce,
          organization: {
            uid: organization.uid,
            credential
          }
        }
      }

      const expectedRootUser = {
        uid: credential.userId,
        role: UserRole.ROOT
      }

      const { status, body } = await request(app.getHttpServer()).post(API_RESOURCE_USER_ENTITY).send(payload)

      const actualOrganization = await orgRepository.findById(organization.uid)
      const actualRootUser = await userRepository.findById(credential.userId)
      const actualCredential = await authCredentialRepository.findById(credential.uid)

      expect(body).toEqual({
        organization,
        rootCredential: credential,
        rootUser: expectedRootUser
      })
      expect(status).toEqual(HttpStatus.CREATED)

      expect(actualOrganization).toEqual(organization)
      expect(actualCredential).toEqual(credential)
      expect(actualRootUser).toEqual(expectedRootUser)
    })
  })
})
