import { Action, Alg, Signature, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization } from '@prisma/client/orchestration'
import { MockProxy, mock } from 'jest-mock-extended'
import request from 'supertest'
import { sha256 } from 'viem'
import { load } from '../../../orchestration.config'
import { REQUEST_HEADER_ORG_ID } from '../../../orchestration.constant'
import { PersistenceModule } from '../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../shared/module/queue/queue.module'
import { ClusterService } from '../../core/service/cluster.service'
import { PolicyEngineModule } from '../../policy-engine.module'

const API_RESOURCE_POLICY_ENGINE_USERS = '/policy-engine/users'

describe('Policy Engine Management', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let clusterServiceMock: MockProxy<ClusterService>

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Evaluation',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication: Signature = {
    alg: Alg.ES256K,
    pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890',
    sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'
  }

  const approvals: Signature[] = [
    {
      alg: Alg.ES256K,
      pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06',
      sig: '0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b'
    },
    {
      alg: Alg.ES256K,
      pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e',
      sig: '0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c'
    }
  ]

  beforeAll(async () => {
    clusterServiceMock = mock<ClusterService>()

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        PolicyEngineModule
      ]
    })
      .overrideProvider(ClusterService)
      .useValue(clusterServiceMock)
      .compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

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

  describe(`POST ${API_RESOURCE_POLICY_ENGINE_USERS}`, () => {
    it('forwards create user request to cluster', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce: 'random-nonce-111',
          user: {
            uid: '68182475-4365-4c4d-a7bd-295daad634c9',
            role: UserRole.ADMIN,
            credential: {
              uid: sha256('0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'),
              userId: '68182475-4365-4c4d-a7bd-295daad634c9',
              alg: Alg.ES256K,
              pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'
            }
          }
        }
      }

      const { status } = await request(app.getHttpServer())
        .post(API_RESOURCE_POLICY_ENGINE_USERS)
        .set(REQUEST_HEADER_ORG_ID, org.id)
        .send(payload)

      expect(clusterServiceMock.createUser).toHaveBeenCalledWith({
        orgId: org.id,
        data: payload
      })

      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
