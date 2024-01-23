import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import { Approval, AuthorizationRequest, SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { createMock } from '@golevelup/ts-jest'
import { HttpService } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus } from '@prisma/client/orchestration'

describe(AuthorizationRequestService.name, () => {
  let module: TestingModule
  let authzRequestRepositoryMock: AuthorizationRequestRepository
  let authzRequestProcessingProducerMock: AuthorizationRequestProcessingProducer
  let httpServiceMock: HttpService
  let service: AuthorizationRequestService

  const authzRequest: AuthorizationRequest = {
    authentication: {
      sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c',
      alg: 'ES256K',
      pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
    },
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    orgId: '',
    status: AuthorizationRequestStatus.PROCESSING,
    request: {
      action: SupportedAction.SIGN_MESSAGE,
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
    authzRequestRepositoryMock = createMock<AuthorizationRequestRepository>()
    authzRequestProcessingProducerMock = createMock<AuthorizationRequestProcessingProducer>()
    httpServiceMock = createMock<HttpService>()

    module = await Test.createTestingModule({
      providers: [
        AuthorizationRequestService,
        {
          provide: AuthorizationRequestRepository,
          useValue: authzRequestRepositoryMock
        },
        {
          provide: AuthorizationRequestProcessingProducer,
          useValue: authzRequestProcessingProducerMock
        },
        {
          provide: HttpService,
          useValue: httpServiceMock
        }
      ]
    }).compile()

    service = module.get<AuthorizationRequestService>(AuthorizationRequestService)
  })

  describe('approve', () => {
    const approval: Approval = {
      id: '3cf9f630-e621-494a-825c-5af917dc3a5e',
      sig: '0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c',
      alg: 'ES256K',
      pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e',
      createdAt: new Date()
    }

    const updatedAuthzRequest: AuthorizationRequest = {
      ...authzRequest,
      approvals: [approval]
    }

    it('creates a new approval and evaluates the authorization request', async () => {
      jest.spyOn(authzRequestRepositoryMock, 'update').mockResolvedValue(updatedAuthzRequest)
      jest.spyOn(service, 'evaluate').mockResolvedValue(updatedAuthzRequest)

      await service.approve(authzRequest.id, approval)

      expect(authzRequestRepositoryMock.update).toHaveBeenCalledWith({
        id: authzRequest.id,
        approvals: [approval]
      })
      expect(service.evaluate).toHaveBeenCalledWith(updatedAuthzRequest)
    })
  })
})
