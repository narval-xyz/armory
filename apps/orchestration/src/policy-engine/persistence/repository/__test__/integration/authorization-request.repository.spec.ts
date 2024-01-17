import { load } from '@app/orchestration/orchestration.config'
import {
  Action,
  Evaluation,
  SignMessageAuthorizationRequest,
  SignTransactionAuthorizationRequest,
  isSignTransaction
} from '@app/orchestration/policy-engine/core/type/domain.type'
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

  const signMessageRequest: SignMessageAuthorizationRequest = {
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    orgId: org.id,
    initiatorId: '5c6df361-8ec7-4cfa-bff6-53ffa7c985ff',
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
    it('creates a new authorization request', async () => {
      await repository.create(signMessageRequest)

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: signMessageRequest.id
        }
      })

      expect(request).toMatchObject(omit('evaluations', signMessageRequest))
    })

    it('defaults status to CREATED', async () => {
      await repository.create(omit('status', signMessageRequest))

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: signMessageRequest.id
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
        ...signMessageRequest,
        evaluations: [permit]
      })

      const evaluations = await testPrismaService.getClient().evaluationLog.findMany({
        where: {
          requestId: signMessageRequest.id
        }
      })

      expect(evaluations).toEqual([
        {
          ...permit,
          requestId: signMessageRequest.id,
          orgId: signMessageRequest.orgId
        }
      ])
    })

    describe(`when action is ${Action.SIGN_TRANSACTION}`, () => {
      const signTransactionRequest: SignTransactionAuthorizationRequest = {
        ...signMessageRequest,
        action: Action.SIGN_TRANSACTION,
        request: {
          from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
          to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
          data: '0x',
          gas: BigInt(5_000)
        }
      }

      it('encodes bigints as strings', async () => {
        await repository.create(signTransactionRequest)

        const authzRequest = await repository.findById(signTransactionRequest.id)

        expect(authzRequest).not.toEqual(null)

        if (authzRequest && isSignTransaction(authzRequest)) {
          expect(authzRequest?.request.gas).toEqual(signTransactionRequest.request.gas)
        }
      })
    })
  })

  describe('update', () => {
    beforeEach(async () => {
      await repository.create(signMessageRequest)
    })

    it('updates status', async () => {
      const authzRequest = await repository.update({
        ...signMessageRequest,
        status: AuthorizationRequestStatus.PERMITTED
      })

      const actual = await repository.findById(signMessageRequest.id)

      expect(authzRequest.status).toEqual(AuthorizationRequestStatus.PERMITTED)
      expect(actual?.status).toEqual(AuthorizationRequestStatus.PERMITTED)
    })

    it('updates evaluations', async () => {
      const authzRequestOne = await repository.update({
        ...signMessageRequest,
        evaluations: [
          {
            id: '404853b2-1338-47f5-be17-a1aa78da8010',
            decision: 'Permit',
            signature: 'test-signature',
            createdAt: new Date()
          }
        ]
      })

      const authzRequestTwo = await repository.update({
        ...signMessageRequest,
        evaluations: [
          {
            id: 'cc329386-a2dd-4024-86fd-323a630ed703',
            decision: 'Permit',
            signature: 'test-signature',
            createdAt: new Date()
          }
        ]
      })

      const actual = await repository.findById(signMessageRequest.id)

      expect(authzRequestOne.evaluations.length).toEqual(1)
      expect(authzRequestTwo.evaluations.length).toEqual(2)
      expect(actual?.evaluations.length).toEqual(2)
    })
  })
})
