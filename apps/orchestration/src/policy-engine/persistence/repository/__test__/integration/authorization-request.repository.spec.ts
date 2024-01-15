import { load } from '@app/orchestration/orchestration.config'
import { Action, AuthorizationRequest, Evaluation } from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Organization } from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'

describe(AuthorizationRequestRepository.name, () => {
  let module: TestingModule
  let repository: AuthorizationRequestRepository
  let testPrismaService: TestPrismaService

  const org: Organization = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    name: 'Test Org',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule
      ],
      providers: [AuthorizationRequestRepository]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    repository = module.get<AuthorizationRequestRepository>(AuthorizationRequestRepository)

    await testPrismaService.getClient().organization.create({ data: org })
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
  })

  describe('create', () => {
    const authzRequest: AuthorizationRequest = {
      id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
      orgId: org.id,
      initiatorId: 'bob',
      status: AuthorizationRequestStatus.PROCESSING,
      action: Action.SIGN_MESSAGE,
      request: {
        message: 'Test request'
      },
      hash: 'test-hash',
      idempotencyKey: null,
      evaluations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('creates a new authorization request', async () => {
      await repository.create(authzRequest)

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: authzRequest.id
        }
      })

      expect(request).toMatchObject(omit('evaluations', authzRequest))
    })

    it('defaults status to CREATED', async () => {
      await repository.create(omit('status', authzRequest))

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: authzRequest.id
        }
      })

      expect(request?.status).toEqual(AuthorizationRequestStatus.CREATED)
    })

    it('creates evaluation logs', async () => {
      const permit: Evaluation = {
        id: '404853b2-1338-47f5-be17-a1aa78da8010',
        decision: 'Permit',
        signature: 'test-signature',
        createdAt: new Date()
      }

      await repository.create({
        ...authzRequest,
        evaluations: [permit]
      })

      const evaluations = await testPrismaService.getClient().evaluationLog.findMany({
        where: {
          requestId: authzRequest.id
        }
      })

      expect(evaluations).toEqual([
        {
          ...permit,
          requestId: authzRequest.id,
          orgId: authzRequest.orgId
        }
      ])
    })
  })
})
