import { PersistenceModule } from '@app/orchestration/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/persistence/service/test-prisma.service'
import { Action, Decision } from '@app/orchestration/policy-engine/core/type/domain.type'
import { PolicyEngineModule } from '@app/orchestration/policy-engine/policy-engine.module'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

describe('Policy Engine Cluster Facade', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PolicyEngineModule, PersistenceModule]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    app = module.createNestApplication()

    await app.init()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    module.close()
  })

  describe('POST /evaluation', () => {
    const EVALUATION_ENDPOINT = '/policy-engine/evaluation'

    it('evaluates a sign message authorization request', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(EVALUATION_ENDPOINT)
        .send({
          action: Action.SIGN_MESSAGE,
          authentication: {
            signature: {
              hash: 'fake-signature-hash-one',
              type: 'ECDSA'
            }
          },
          approval: {
            signatures: [{ hash: 'fake-signature-hash-two', type: 'ECDSA' }]
          },
          request: {
            message: 'Sign me, please!'
          }
        })

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toEqual({
        decision: Decision.CONFIRM,
        reasons: [
          {
            code: 'require_approval',
            message: 'Missing one or more approval(s)'
          }
        ]
      })
    })
  })

  // Temporary test to ensure the connectivity with a test database.
  describe('GET /users', () => {
    const USERS_ENDPOINT = '/policy-engine/users'

    const bob = {
      id: 1,
      email: 'bob@test.com',
      name: 'Bob'
    }

    const alice = {
      id: 2,
      email: 'alice@test.com',
      name: 'Alice'
    }

    const sortByEmail = (a: { email: string }, b: { email: string }) => a.email.localeCompare(b.email)

    beforeEach(async () => {
      await testPrismaService.getPrismaClient().user.createMany({
        data: [alice, bob]
      })
    })

    it('responds with users', async () => {
      const { status, body } = await request(app.getHttpServer()).get(USERS_ENDPOINT)

      expect(status).toEqual(HttpStatus.OK)
      expect(body.sort(sortByEmail)).toEqual([alice, bob].sort(sortByEmail))
    })
  })
})
