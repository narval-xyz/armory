import { Action, Signature } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Organization } from '@prisma/client/armory'
import { omit } from 'lodash/fp'
import { load } from '../../../../../armory.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { Approval, AuthorizationRequest, Evaluation, SignTransaction } from '../../../../core/type/domain.type'
import { AuthorizationRequestRepository } from '../../../repository/authorization-request.repository'

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

  const authentication: Signature = {
    alg: Alg.ES256K,
    pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890',
    sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'
  }

  const signMessageRequest: AuthorizationRequest = {
    authentication,
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    orgId: org.id,
    status: AuthorizationRequestStatus.PROCESSING,
    request: {
      action: Action.SIGN_MESSAGE,
      nonce: '99',
      resourceId: '239bb48b-f708-47ba-97fa-ef336be4dffe',
      message: 'Test request'
    },
    idempotencyKey: null,
    approvals: [],
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

      expect(request).toMatchObject(omit(['evaluations', 'approvals', 'authentication'], signMessageRequest))
      expect({
        sig: request?.authnSig,
        alg: request?.authnAlg,
        pubKey: request?.authnPubKey
      }).toEqual(authentication)
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

    it('creates approvals', async () => {
      const approval: Approval = {
        id: 'c534332f-6dd9-4cc8-b727-e1ad21176238',
        alg: Alg.ES256K,
        sig: 'test-signature',
        pubKey: 'test-public-key',
        createdAt: new Date()
      }

      await repository.create({
        ...signMessageRequest,
        approvals: [approval]
      })

      const approvals = await testPrismaService.getClient().authorizationRequestApproval.findMany({
        where: {
          requestId: signMessageRequest.id
        }
      })

      expect(approvals).toEqual([
        {
          ...approval,
          requestId: signMessageRequest.id
        }
      ])
    })

    describe(`when action is ${Action.SIGN_TRANSACTION}`, () => {
      const signTransaction: SignTransaction = {
        action: Action.SIGN_TRANSACTION,
        nonce: '99',
        resourceId: '3be0c61d-9b41-423f-80b8-ea6f7624d917',
        transactionRequest: {
          from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
          gas: BigInt(5_000),
          chainId: 1,
          nonce: 1
        }
      }

      const signTransactionRequest: AuthorizationRequest = {
        ...signMessageRequest,
        request: signTransaction
      }

      it('encodes bigints as strings', async () => {
        await repository.create(signTransactionRequest)

        const authzRequest = await repository.findById(signTransactionRequest.id)

        expect(authzRequest).not.toEqual(null)

        if (authzRequest && authzRequest.request.action === Action.SIGN_TRANSACTION) {
          expect(authzRequest?.request.transactionRequest.gas).toEqual(signTransaction.transactionRequest.gas)
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

    it('appends evaluations', async () => {
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

    it('appends approvals', async () => {
      const authzRequestOne = await repository.update({
        ...signMessageRequest,
        approvals: [
          {
            id: 'c534332f-6dd9-4cc8-b727-e1ad21176238',
            alg: Alg.ES256K,
            sig: 'test-signature',
            pubKey: 'test-public-key',
            createdAt: new Date()
          }
        ]
      })

      const authzRequestTwo = await repository.update({
        ...signMessageRequest,
        approvals: [
          {
            id: '790e30b0-35d1-4e22-8be5-71e64afbee89',
            alg: Alg.ES256K,
            sig: 'test-signature',
            pubKey: 'test-public-key',
            createdAt: new Date()
          }
        ]
      })

      const actual = await repository.findById(signMessageRequest.id)

      expect(authzRequestOne.approvals.length).toEqual(1)
      expect(authzRequestTwo.approvals.length).toEqual(2)
      expect(actual?.approvals.length).toEqual(2)
    })
  })
})
