import { ConfigModule } from '@narval/config-module'
import { LoggerModule, secret } from '@narval/nestjs-shared'
import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestError,
  EntityType,
  Evaluation,
  FIXTURE,
  SignTransaction
} from '@narval/policy-engine-shared'
import { Alg, generateJwk, getPublicKey, hash, signJwt } from '@narval/signature'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorizationRequestStatus, Client, Prisma } from '@prisma/client/armory'
import { omit } from 'lodash/fp'
import { load } from '../../../../../armory.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { AuthorizationRequestRepository } from '../../../repository/authorization-request.repository'

describe(AuthorizationRequestRepository.name, () => {
  let module: TestingModule
  let repository: AuthorizationRequestRepository
  let testPrismaService: TestPrismaService

  const client: Client = {
    id: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc',
    clientSecret: secret.hash('test-client-secret'),
    dataSecret: secret.hash('test-data-secret'),
    name: 'Test Client',
    enginePublicKey: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const authentication =
    '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'

  const baseAuthzRequest: AuthorizationRequest = {
    authentication,
    id: '6c7e92fc-d2b0-4840-8e9b-485393ecdf89',
    clientId: client.id,
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
        LoggerModule.forTest(),
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

    await testPrismaService.getClient().client.create({
      data: {
        ...client,
        enginePublicKey: client.enginePublicKey as Prisma.InputJsonValue,
        dataStoreKeys: {
          create: [
            {
              storeType: 'entity',
              publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
            },
            {
              storeType: 'policy',
              publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
            }
          ]
        }
      }
    })
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
    await module.close()
  })

  describe('create', () => {
    it('creates a new authorization request', async () => {
      await repository.create(baseAuthzRequest)

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: baseAuthzRequest.id
        }
      })

      expect(request).toMatchObject(omit(['evaluations', 'approvals', 'authentication'], baseAuthzRequest))
      expect(request?.authnSig).toEqual(authentication)
    })

    it('defaults status to CREATED', async () => {
      await repository.create(omit('status', baseAuthzRequest))

      const request = await testPrismaService.getClient().authorizationRequest.findFirst({
        where: {
          id: baseAuthzRequest.id
        }
      })

      expect(request?.status).toEqual(AuthorizationRequestStatus.CREATED)
    })

    it('creates evaluation logs', async () => {
      const permit: Evaluation = {
        id: '404853b2-1338-47f5-be17-a1aa78da8010',
        decision: 'Permit',
        signature: 'test-signature',
        createdAt: new Date(),
        transactionRequestIntent: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '239bb48b-f708-47ba-97fa-ef336be4dffe',
          message: 'Test request'
        },
        approvalRequirements: {
          required: [
            {
              approvalCount: 1,
              approvalEntityType: EntityType.User,
              entityIds: [client.id],
              countPrincipal: true
            }
          ],
          missing: [
            {
              approvalCount: 1,
              approvalEntityType: EntityType.User,
              entityIds: [client.id],
              countPrincipal: true
            }
          ],
          satisfied: []
        }
      }

      const { evaluations } = await repository.create({
        ...baseAuthzRequest,
        evaluations: [permit]
      })

      expect(evaluations).toEqual([permit])
    })

    it('creates approvals', async () => {
      const approval = 'test-signature'

      await repository.create({
        ...baseAuthzRequest,
        approvals: [approval]
      })

      const approvals = await testPrismaService.getClient().authorizationRequestApproval.findMany({
        where: {
          requestId: baseAuthzRequest.id
        }
      })

      expect(approvals.map(omit(['id', 'createdAt', 'error']))).toEqual([
        {
          sig: approval,
          requestId: baseAuthzRequest.id
        }
      ])
    })

    it('creates errors', async () => {
      const error: AuthorizationRequestError = {
        id: 'test-error-id',
        name: 'ErrorName',
        message: 'Something went wrong'
      }

      await repository.create({
        ...baseAuthzRequest,
        errors: [error]
      })

      const errors = await testPrismaService.getClient().authorizationRequestError.findMany({
        where: {
          requestId: baseAuthzRequest.id
        }
      })

      expect(errors.map(omit(['createdAt', 'clientId', 'requestId']))).toEqual([error])
    })

    it('creates request with confirmation claim metadata', async () => {
      const privateKey = await generateJwk(Alg.EDDSA)

      const authzRequest: AuthorizationRequest = {
        ...baseAuthzRequest,
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(privateKey),
              proof: 'jws',
              jws: await signJwt({ requestHash: hash({ it: 'does not matter here' }) }, privateKey)
            }
          }
        },
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '3be0c61d-9b41-423f-80b8-ea6f7624d917',
          message: 'sign me!'
        }
      }

      await repository.create(authzRequest)

      const createdAuthzRequest = await repository.findById(authzRequest.id)

      expect(createdAuthzRequest).toEqual(authzRequest)
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
        ...baseAuthzRequest,
        request: signTransaction
      }

      it('encodes bigints as strings', async () => {
        await repository.create(signTransactionRequest)

        const authzRequest = await repository.findById(signTransactionRequest.id)

        expect(authzRequest).not.toEqual(null)

        if (authzRequest && authzRequest.request.action === Action.SIGN_TRANSACTION) {
          expect(authzRequest?.request.transactionRequest.gas).toEqual(signTransaction.transactionRequest.gas)
        } else {
          fail(`expect authorization request action equals to ${Action.SIGN_TRANSACTION}`)
        }
      })
    })

    describe(`when action is ${Action.SIGN_MESSAGE}`, () => {
      const authzRequest: AuthorizationRequest = {
        ...baseAuthzRequest,
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '3be0c61d-9b41-423f-80b8-ea6f7624d917',
          message: 'sign me!'
        }
      }

      it('decodes request correctly', async () => {
        await repository.create(authzRequest)

        const createdAuthzRequest = await repository.findById(authzRequest.id)

        expect(createdAuthzRequest).toEqual(authzRequest)
      })
    })

    describe(`when action is ${Action.SIGN_RAW}`, () => {
      const authzRequest: AuthorizationRequest = {
        ...baseAuthzRequest,
        request: {
          action: Action.SIGN_RAW,
          nonce: '99',
          resourceId: '3be0c61d-9b41-423f-80b8-ea6f7624d917',
          rawMessage: '0x123'
        }
      }

      it('decodes correctly', async () => {
        await repository.create(authzRequest)

        const createdAuthzRequest = await repository.findById(authzRequest.id)

        expect(createdAuthzRequest).toEqual(authzRequest)
      })
    })

    describe(`when action is ${Action.SIGN_TYPED_DATA}`, () => {
      const authzRequest: AuthorizationRequest = {
        ...baseAuthzRequest,
        request: {
          action: Action.SIGN_TYPED_DATA,
          nonce: '99',
          resourceId: '3be0c61d-9b41-423f-80b8-ea6f7624d917',
          typedData: {
            domain: {
              name: 'Ether Mail',
              version: '1',
              chainId: 1,
              verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
            },
            types: {
              Person: [
                { name: 'name', type: 'string' },
                { name: 'account', type: 'address' }
              ],
              Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' }
              ]
            },
            primaryType: 'Mail',
            message: {
              from: {
                name: 'Cow',
                account: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
              },
              to: {
                name: 'Bob',
                account: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
              },
              contents: 'Hello, Bob!'
            }
          }
        }
      }

      it('decodes request correctly', async () => {
        await repository.create(authzRequest)

        const createdAuthzRequest = await repository.findById(authzRequest.id)

        expect(createdAuthzRequest).toEqual(authzRequest)
      })
    })
  })

  describe('update', () => {
    beforeEach(async () => {
      await repository.create(baseAuthzRequest)
    })

    it('updates status', async () => {
      const authzRequest = await repository.update({
        ...baseAuthzRequest,
        status: AuthorizationRequestStatus.PERMITTED
      })

      const actual = await repository.findById(baseAuthzRequest.id)

      expect(authzRequest.status).toEqual(AuthorizationRequestStatus.PERMITTED)
      expect(actual?.status).toEqual(AuthorizationRequestStatus.PERMITTED)
    })

    it('appends evaluations', async () => {
      const authzRequestOne = await repository.update({
        ...baseAuthzRequest,
        evaluations: [
          {
            id: '404853b2-1338-47f5-be17-a1aa78da8010',
            decision: 'Confirm',
            signature: 'test-signature',
            transactionRequestIntent: null,
            approvalRequirements: {
              required: [
                {
                  approvalCount: 1,
                  approvalEntityType: EntityType.User,
                  entityIds: [client.id],
                  countPrincipal: true
                }
              ],
              missing: [
                {
                  approvalCount: 1,
                  approvalEntityType: EntityType.User,
                  entityIds: [client.id],
                  countPrincipal: true
                }
              ],
              satisfied: []
            },
            createdAt: new Date()
          }
        ]
      })

      const authzRequestTwo = await repository.update({
        ...baseAuthzRequest,
        evaluations: [
          {
            id: 'cc329386-a2dd-4024-86fd-323a630ed703',
            decision: 'Permit',
            signature: 'test-signature',
            approvalRequirements: {
              required: [
                {
                  approvalCount: 1,
                  approvalEntityType: EntityType.User,
                  entityIds: [client.id],
                  countPrincipal: true
                }
              ],
              missing: [],
              satisfied: [
                {
                  approvalCount: 1,
                  approvalEntityType: EntityType.User,
                  entityIds: [client.id],
                  countPrincipal: true
                }
              ]
            },
            transactionRequestIntent: null,
            createdAt: new Date()
          }
        ]
      })

      const actual = await repository.findById(baseAuthzRequest.id)

      expect(authzRequestOne.evaluations.length).toEqual(1)
      expect(authzRequestTwo.evaluations.length).toEqual(2)
      expect(actual?.evaluations.length).toEqual(2)

      expect(actual?.evaluations[0].approvalRequirements?.required?.length).toEqual(1)
      expect(actual?.evaluations[0].approvalRequirements?.missing?.length).toEqual(1)
      expect(actual?.evaluations[0].approvalRequirements?.satisfied?.length).toEqual(0)

      expect(actual?.evaluations[1].approvalRequirements?.required?.length).toEqual(1)
      expect(actual?.evaluations[1].approvalRequirements?.missing?.length).toEqual(0)
      expect(actual?.evaluations[1].approvalRequirements?.satisfied?.length).toEqual(1)
    })

    it('appends approvals', async () => {
      const authzRequestOne = await repository.update({
        ...baseAuthzRequest,
        approvals: ['test-signature']
      })

      const authzRequestTwo = await repository.update({
        ...baseAuthzRequest,
        approvals: ['test-signature']
      })

      const actual = await repository.findById(baseAuthzRequest.id)

      expect(authzRequestOne.approvals?.length).toEqual(1)
      expect(authzRequestTwo.approvals?.length).toEqual(2)
      expect(actual?.approvals?.length).toEqual(2)
    })

    it('appends errors', async () => {
      const authzRequestOne = await repository.update({
        ...baseAuthzRequest,
        errors: [
          {
            id: 'test-error-id-one',
            name: 'ErrorNameOne',
            message: 'Something went wrong one'
          }
        ]
      })

      const authzRequestTwo = await repository.update({
        ...baseAuthzRequest,
        errors: [
          {
            id: 'test-error-id-two',
            name: 'ErrorNameTwo',
            message: 'Something went wrong two'
          }
        ]
      })

      const actual = await repository.findById(baseAuthzRequest.id)

      expect(authzRequestOne?.errors?.length).toEqual(1)
      expect(authzRequestTwo?.errors?.length).toEqual(2)
      expect(actual?.errors?.length).toEqual(2)
    })
  })
})
