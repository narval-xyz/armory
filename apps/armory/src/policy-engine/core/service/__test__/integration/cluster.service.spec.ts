import { ConfigModule } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import {
  Action,
  DataStoreConfiguration,
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  PublicClient,
  Request,
  SignMessageAction,
  Source,
  SourceType
} from '@narval/policy-engine-shared'
import { PrivateKey, SigningAlg, getPublicKey, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { HttpModule } from '@nestjs/axios'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { v4 as uuid } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'
import { load } from '../../../../../armory.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { PolicyEngineClient } from '../../../../http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from '../../../../persistence/repository/policy-engine-node.repository'
import { ClusterNotFoundException } from '../../../exception/cluster-not-found.exception'
import { ConsensusAgreementNotReachException } from '../../../exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../../../exception/invalid-attestation-signature.exception'
import { ClusterService } from '../../cluster.service'

describe(ClusterService.name, () => {
  let clusterService: ClusterService
  let policyEngineNodeRepository: PolicyEngineNodeRepository
  let testPrismaService: TestPrismaService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PersistenceModule,
        HttpModule,
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [ClusterService, PolicyEngineClient, PolicyEngineNodeRepository]
    }).compile()

    clusterService = module.get<ClusterService>(ClusterService)
    policyEngineNodeRepository = module.get<PolicyEngineNodeRepository>(PolicyEngineNodeRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('create', () => {
    const nodeUrl = 'http://localost:1'

    const clientId = 'test-client-id'

    const dataStoreSource: Source = {
      type: SourceType.HTTP,
      url: 'http://localost:999'
    }

    const dataStoreConfig: DataStoreConfiguration = {
      data: dataStoreSource,
      signature: dataStoreSource,
      keys: [getPublicKey(privateKeyToJwk(generatePrivateKey()))]
    }

    const createClientResponse: PublicClient = {
      clientId,
      clientSecret: secret.generate(),
      createdAt: new Date(),
      updatedAt: new Date(),
      signer: {
        publicKey: getPublicKey(privateKeyToJwk(generatePrivateKey()))
      },
      dataStore: {
        entity: dataStoreConfig,
        policy: dataStoreConfig
      }
    }

    it('creates a new client in the given policy engines', async () => {
      nock(nodeUrl).post('/clients').reply(HttpStatus.CREATED, createClientResponse)

      const [node] = await clusterService.create({
        clientId,
        nodes: [nodeUrl],
        entityDataStore: dataStoreConfig,
        policyDataStore: dataStoreConfig
      })

      expect(node).toEqual({
        id: expect.any(String),
        clientId,
        clientSecret: expect.any(String),
        url: nodeUrl,
        publicKey: createClientResponse.signer.publicKey
      })
    })

    it('creates a new policy engine node', async () => {
      nock(nodeUrl).post('/clients').reply(HttpStatus.CREATED, createClientResponse)

      const [node] = await clusterService.create({
        clientId,
        nodes: [nodeUrl],
        entityDataStore: dataStoreConfig,
        policyDataStore: dataStoreConfig
      })

      const nodes = await policyEngineNodeRepository.findByUrl(nodeUrl)

      expect(nodes).toEqual([node])
    })
  })

  describe('evaluate', () => {
    const nodeOne = {
      url: 'http://policy-engine-one.test',
      attestationPrivateKey: privateKeyToJwk(generatePrivateKey())
    }

    const nodeTwo = {
      url: 'http://policy-engine-two.test',
      attestationPrivateKey: privateKeyToJwk(generatePrivateKey())
    }

    const signTransaction: SignMessageAction = {
      action: Action.SIGN_MESSAGE,
      nonce: uuid(),
      resourceId: 'test-resource-id',
      message: 'sign me'
    }

    const clientId = 'test-client-id'

    const evaluation: EvaluationRequest = {
      authentication: 'foo',
      approvals: [],
      request: signTransaction,
      feeds: []
    }

    const mockPolicyEngineEvaluation = async (opts: {
      url: string
      decision: Decision
      request: Request
      attestationPrivateKey: PrivateKey
    }) => {
      const requestHash = hash(opts.request)
      const token = await signJwt(
        {
          requestHash
        },
        opts.attestationPrivateKey,
        { alg: SigningAlg.EIP191 }
      )
      const mockResponse: EvaluationResponse = {
        decision: opts.decision,
        approvals: {
          required: [],
          satisfied: [],
          missing: []
        },
        accessToken: { value: token }
      }

      const scope = nock(opts.url).post('/evaluations').reply(HttpStatus.OK, mockResponse)

      return { mockResponse, scope }
    }

    beforeEach(async () => {
      await policyEngineNodeRepository.bulkCreate([
        {
          id: uuid(),
          clientId,
          clientSecret: 'test-client-secret',
          url: nodeOne.url,
          publicKey: getPublicKey(nodeOne.attestationPrivateKey)
        },
        {
          id: uuid(),
          clientId,
          clientSecret: 'test-client-secret',
          url: nodeTwo.url,
          publicKey: getPublicKey(nodeTwo.attestationPrivateKey)
        }
      ])
    })

    it('responds with the first response from the cluster', async () => {
      const { mockResponse: mockResponseOne } = await mockPolicyEngineEvaluation({
        ...nodeOne,
        decision: Decision.PERMIT,
        request: signTransaction
      })

      const { mockResponse: mockResponseTwo } = await mockPolicyEngineEvaluation({
        ...nodeTwo,
        decision: Decision.PERMIT,
        request: signTransaction
      })

      const response = await clusterService.evaluate(clientId, evaluation)

      expect(response).toEqual(mockResponseOne)
      expect(response).not.toEqual(mockResponseTwo)
    })

    it('throws when client nodes are not found', async () => {
      await expect(clusterService.evaluate('not-found', evaluation)).rejects.toThrow(ClusterNotFoundException)
    })

    it('throws when the nodes consensus disagree on the decision', async () => {
      await mockPolicyEngineEvaluation({
        ...nodeOne,
        decision: Decision.PERMIT,
        request: signTransaction
      })

      await mockPolicyEngineEvaluation({
        ...nodeTwo,
        decision: Decision.FORBID,
        request: signTransaction
      })

      await expect(clusterService.evaluate(clientId, evaluation)).rejects.toThrow(ConsensusAgreementNotReachException)
    })

    it('throws when node attestation is invalid', async () => {
      await mockPolicyEngineEvaluation({
        ...nodeOne,
        decision: Decision.PERMIT,
        request: signTransaction
      })

      await mockPolicyEngineEvaluation({
        url: nodeTwo.url,
        attestationPrivateKey: privateKeyToJwk(generatePrivateKey()),
        decision: Decision.PERMIT,
        request: signTransaction
      })

      await expect(clusterService.evaluate(clientId, evaluation)).rejects.toThrow(InvalidAttestationSignatureException)
    })
  })
})
