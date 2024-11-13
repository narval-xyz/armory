import { ConfigModule, ConfigService } from '@narval/config-module'
import {
  LoggerModule,
  MetricService,
  OTEL_ATTR_CLIENT_ID,
  OpenTelemetryModule,
  StatefulMetricService,
  secret
} from '@narval/nestjs-shared'
import {
  DataStoreConfiguration,
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  PublicClient,
  Request,
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
import { generateSignTransactionRequest } from '../../../../../__test__/fixture/authorization-request.fixture'
import { Config, load } from '../../../../../armory.config'
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
  let configService: ConfigService<Config>
  let statefulMetricService: StatefulMetricService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        PersistenceModule,
        HttpModule,
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        OpenTelemetryModule.forTest()
      ],
      providers: [ClusterService, PolicyEngineClient, PolicyEngineNodeRepository]
    }).compile()

    clusterService = module.get(ClusterService)
    policyEngineNodeRepository = module.get(PolicyEngineNodeRepository)
    testPrismaService = module.get(TestPrismaService)
    configService = module.get(ConfigService)
    statefulMetricService = module.get(MetricService)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('create', () => {
    let nodeUrl: string

    beforeEach(() => {
      nodeUrl = configService.get('policyEngine.nodes')[0].url
    })

    const clientId = 'test-client-id'

    const dataStoreSource: Source = {
      type: SourceType.HTTP,
      url: 'http://mock.test/data-store'
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
      nock(nodeUrl).post('/v1/clients').reply(HttpStatus.CREATED, createClientResponse)

      const [node] = await clusterService.create({
        clientId,
        nodes: [nodeUrl],
        entityDataStore: dataStoreConfig,
        policyDataStore: dataStoreConfig,
        allowSelfSignedData: false
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
      nock(nodeUrl).post('/v1/clients').reply(HttpStatus.CREATED, createClientResponse)

      const [node] = await clusterService.create({
        clientId,
        nodes: [nodeUrl],
        entityDataStore: dataStoreConfig,
        policyDataStore: dataStoreConfig,
        allowSelfSignedData: false
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

    const signTransaction = generateSignTransactionRequest()

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

      const scope = nock(opts.url).post('/v1/evaluations').reply(HttpStatus.OK, mockResponse)

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
        }
      ])
    })

    it('responds with the first response from the cluster', async () => {
      const { mockResponse: mockResponseOne } = await mockPolicyEngineEvaluation({
        ...nodeOne,
        decision: Decision.PERMIT,
        request: signTransaction
      })

      const response = await clusterService.evaluate(clientId, evaluation)

      expect(response).toEqual(mockResponseOne)
    })

    it('throws when client nodes are not found', async () => {
      await expect(clusterService.evaluate('not-found', evaluation)).rejects.toThrow(ClusterNotFoundException)
    })

    it('throws when the nodes consensus disagree on the decision', async () => {
      await policyEngineNodeRepository.bulkCreate([
        {
          id: uuid(),
          clientId,
          clientSecret: 'test-client-secret',
          url: nodeTwo.url,
          publicKey: getPublicKey(nodeTwo.attestationPrivateKey)
        }
      ])
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
        attestationPrivateKey: privateKeyToJwk(generatePrivateKey()),
        decision: Decision.PERMIT,
        request: signTransaction
      })

      await expect(clusterService.evaluate(clientId, evaluation)).rejects.toThrow(InvalidAttestationSignatureException)
    })
  })

  describe('sync', () => {
    const nodeOneUrl = 'http://mock.test/policy-engine-node-one'
    const nodeTwoUrl = 'http://mock.test/policy-engine-node-two'

    const clientId = 'test-client-id'

    const clientSecret = 'test-client-secret'

    const mockPolicyEngineClientSync = async (opts: {
      url: string
      clientId: string
      clientSecret: string
      success: boolean
    }) => {
      const mockResponse = { success: opts.success }

      const scope = nock(opts.url, {
        reqheaders: {
          'x-client-id': opts.clientId,
          'x-client-secret': opts.clientSecret
        }
      })
        .post('/v1/clients/sync')
        .reply(HttpStatus.OK, mockResponse)

      return { mockResponse, scope }
    }

    beforeEach(async () => {
      await policyEngineNodeRepository.bulkCreate([
        {
          id: uuid(),
          clientId,
          clientSecret,
          url: nodeOneUrl,
          publicKey: getPublicKey(privateKeyToJwk(generatePrivateKey()))
        },
        {
          id: uuid(),
          clientId,
          clientSecret,
          url: nodeTwoUrl,
          publicKey: getPublicKey(privateKeyToJwk(generatePrivateKey()))
        }
      ])
    })

    it('returns success true when all nodes synced successfuly', async () => {
      await mockPolicyEngineClientSync({
        url: nodeOneUrl,
        clientId,
        clientSecret,
        success: true
      })
      await mockPolicyEngineClientSync({
        url: nodeTwoUrl,
        clientId,
        clientSecret,
        success: true
      })

      const success = await clusterService.sync(clientId)

      expect(success).toEqual(true)
    })

    it('returns success false when one node synced failed', async () => {
      await mockPolicyEngineClientSync({
        url: nodeOneUrl,
        clientId,
        clientSecret,
        success: true
      })
      await mockPolicyEngineClientSync({
        url: nodeTwoUrl,
        clientId,
        clientSecret,
        success: false
      })

      const success = await clusterService.sync(clientId)

      expect(success).toEqual(false)
    })

    it('throws when client nodes are not found', async () => {
      await expect(clusterService.sync('not-found')).rejects.toThrow(ClusterNotFoundException)
    })

    it('increments sync counter metric', async () => {
      await mockPolicyEngineClientSync({
        url: nodeOneUrl,
        clientId,
        clientSecret,
        success: true
      })
      await mockPolicyEngineClientSync({
        url: nodeTwoUrl,
        clientId,
        clientSecret,
        success: true
      })

      await clusterService.sync(clientId)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'cluster_sync_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: 'test-client-id'
          }
        }
      ])
    })
  })
})
