import { ConfigModule } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration, PublicClient, Source, SourceType } from '@narval/policy-engine-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { HttpModule } from '@nestjs/axios'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { generatePrivateKey } from 'viem/accounts'
import { load } from '../../../../../armory.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { PolicyEngineClient } from '../../../../http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from '../../../../persistence/repository/policy-engine-node.repository'
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
})
