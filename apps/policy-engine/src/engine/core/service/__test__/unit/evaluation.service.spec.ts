import { LoggerModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import {
  Action,
  Client,
  DataStoreConfiguration,
  Decision,
  EntityUtil,
  EvaluationRequest,
  EvaluationResponse,
  FIXTURE,
  GrantPermissionAction,
  Request,
  SignTransactionAction
} from '@narval/policy-engine-shared'
import { Alg, PrivateKey, decodeJwt, generateJwk, getPublicKey, nowSeconds } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { OpenPolicyAgentEngine } from '../../../../../open-policy-agent/core/open-policy-agent.engine'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { OpenPolicyAgentEngineFactory } from '../../../factory/open-policy-agent-engine.factory'
import { ClientService } from '../../client.service'
import { EvaluationService, buildPermitTokenPayload } from '../../evaluation.service'
import { SimpleSigningService } from '../../signing-basic.service'

const ONE_DAY = 86400

const cnf = {
  alg: 'ES256K',
  crv: 'secp256k1',
  kid: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
  kty: 'EC',
  x: 'zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY',
  y: '6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs'
}

const baseResponse: EvaluationResponse = {
  decision: Decision.PERMIT,
  principal: FIXTURE.CREDENTIAL.Alice,
  request: {} as Request
}

describe('buildPermitTokenPayload for signTransaction action', () => {
  const request: SignTransactionAction = {
    action: 'signTransaction',
    nonce: 'random-nonce-111',
    transactionRequest: {
      from: '0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      to: '0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      chainId: 137,
      value: '0xde0b6b3a7640000',
      data: '0x00000000',
      nonce: 192,
      type: '2'
    },
    resourceId: 'eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4'
  }

  const evalResponse: EvaluationResponse = {
    ...baseResponse,
    request
  }

  it('throws an error if decision is not PERMIT', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, decision: Decision.FORBID }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('throws an error if principal is missing', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, principal: undefined }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('throws an error if request is missing', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, request: undefined }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('returns a jwt payload if all conditions are met', async () => {
    const payload = await buildPermitTokenPayload('clientId', evalResponse)

    expect(payload).toEqual({
      cnf,
      iat: nowSeconds(),
      requestHash: '0x608abe908cffeab1fc33edde6b44586f9dacbc9c6fe6f0a13fa307237290ce5a',
      hashWildcard: [
        'transactionRequest.gas',
        'transactionRequest.maxFeePerGas',
        'transactionRequest.maxPriorityFeePerGas'
      ],
      sub: 'test-alice-user-uid'
    })
  })
})

describe('buildPermitTokenPayload for grantPermission action', () => {
  const request: GrantPermissionAction = {
    action: 'grantPermission',
    nonce: 'random-nonce-111',
    resourceId: 'vault',
    permissions: ['wallet:import']
  }

  const evalResponse: EvaluationResponse = {
    ...baseResponse,
    request,
    metadata: {
      expiresIn: ONE_DAY,
      issuer: 'clientId.armory.narval.xyz'
    }
  }
  it('throws an error if decision is not PERMIT', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, decision: Decision.FORBID }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('throws an error if principal is missing', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, principal: undefined }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('throws an error if request is missing', async () => {
    const evaluation: EvaluationResponse = { ...evalResponse, request: undefined }
    await expect(buildPermitTokenPayload('clientId', evaluation)).rejects.toThrow(ApplicationException)
  })

  it('returns a jwt payload if all conditions are met', async () => {
    const payload = await buildPermitTokenPayload('clientId', evalResponse)
    const iat = nowSeconds()

    expect(payload).toEqual({
      cnf,
      iat,
      exp: iat + ONE_DAY,
      iss: 'clientId.armory.narval.xyz',
      sub: 'test-alice-user-uid',
      access: [
        {
          resource: 'vault',
          permissions: ['wallet:import']
        }
      ]
    })
  })
})

describe(EvaluationService.name, () => {
  let service: EvaluationService
  let client: Client
  let clientSignerPrivateKey: PrivateKey
  let openPolicyAgentEngineMock: MockProxy<OpenPolicyAgentEngine>

  const evaluationResponse: EvaluationResponse = {
    decision: Decision.PERMIT,
    request: {
      action: Action.SIGN_MESSAGE,
      nonce: '99',
      resourceId: 'test-resource-id',
      message: 'sign me'
    },
    accessToken: {
      value: ''
    },
    principal: FIXTURE.CREDENTIAL.Bob
  }

  beforeEach(async () => {
    clientSignerPrivateKey = await generateJwk(Alg.ES256K)

    client = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      dataStore: {
        entity: {} as DataStoreConfiguration,
        policy: {} as DataStoreConfiguration
      },
      signer: {
        publicKey: getPublicKey(clientSignerPrivateKey),
        privateKey: clientSignerPrivateKey
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    openPolicyAgentEngineMock = mock<OpenPolicyAgentEngine>()
    openPolicyAgentEngineMock.evaluate.mockResolvedValue(evaluationResponse)

    const openPolicyAgentEngineFactoryMock = mock<OpenPolicyAgentEngineFactory>()
    openPolicyAgentEngineFactoryMock.create.mockResolvedValue(openPolicyAgentEngineMock)

    const clientServiceMock = mock<ClientService>()
    clientServiceMock.findById.mockResolvedValue(client)
    clientServiceMock.findEntityStore.mockResolvedValue({
      data: EntityUtil.empty(),
      signature: ''
    })
    clientServiceMock.findPolicyStore.mockResolvedValue({
      data: [],
      signature: ''
    })

    const module = await Test.createTestingModule({
      imports: [LoggerModule.forTest(), OpenTelemetryModule.forTest()],
      providers: [
        EvaluationService,
        {
          provide: OpenPolicyAgentEngineFactory,
          useValue: openPolicyAgentEngineFactoryMock
        },
        {
          provide: 'SigningService',
          useClass: SimpleSigningService
        },
        {
          provide: ClientService,
          useValue: clientServiceMock
        }
      ]
    }).compile()

    service = module.get(EvaluationService)
  })

  describe('evaluate', () => {
    describe('when confirmation (cnf) claim metadata is given', () => {
      let bindPrivateKey: PrivateKey

      let request: EvaluationRequest
      let response: EvaluationResponse

      beforeEach(async () => {
        bindPrivateKey = await generateJwk(Alg.EDDSA)

        const action = {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: 'test-resource-id',
          message: 'sign me'
        }

        request = {
          authentication: 'fake-jwt',
          metadata: {
            confirmation: {
              key: {
                jwk: getPublicKey(bindPrivateKey)
              }
            }
          },
          approvals: [],
          request: action,
          feeds: []
        }

        response = {
          decision: Decision.PERMIT,
          request: action,
          metadata: request.metadata,
          accessToken: {
            value: ''
          },
          principal: FIXTURE.CREDENTIAL.Bob
        }

        openPolicyAgentEngineMock.evaluate.mockResolvedValue(response)
      })

      it('adds the public key as the cnf in the access token', async () => {
        const response = await service.evaluate(client.clientId, request)

        if (response.accessToken) {
          const jwt = decodeJwt(response.accessToken.value)

          expect(jwt.payload.cnf).toEqual(getPublicKey(bindPrivateKey))
        } else {
          fail('expect response to contain an access token')
        }
      })
    })
  })
})
