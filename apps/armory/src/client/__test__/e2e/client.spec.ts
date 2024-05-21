import { ConfigModule, ConfigService } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration, HttpSource, PublicClient, Source, SourceType } from '@narval/policy-engine-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import nock from 'nock'
import request from 'supertest'
import { generatePrivateKey } from 'viem/accounts'
import { Config, load } from '../../../armory.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { ClientModule } from '../../client.module'
import { ClientService } from '../../core/service/client.service'
import { CreateClientRequestDto } from '../../http/rest/dto/create-client.dto'

// TODO: (@wcalderipe, 16/05/24) Evaluate testcontainers
// https://node.testcontainers.org/quickstart/
// The goal is to replace the mock server in the E2E test, which can be
// misinterpreted by a human, with a real server in a container for a more
// accurate and reliable tests.
const mockPolicyEngineServer = (url: string, clientId: string) => {
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

  nock(url).post('/clients').reply(HttpStatus.CREATED, createClientResponse)
}

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let clientService: ClientService
  let configService: ConfigService<Config>
  let testPrismaService: TestPrismaService

  const clientId = 'test-client-id'

  const entityStorePublicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  const policyStorePublicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        ClientModule
      ]
    }).compile()

    app = module.createNestApplication()

    clientService = module.get<ClientService>(ClientService)
    configService = module.get<ConfigService<Config>>(ConfigService)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('POST /clients', () => {
    const dataStoreSource: HttpSource = {
      type: SourceType.HTTP,
      url: 'http://127.0.0.1:9999/test-data-store'
    }

    const createClientPayload: CreateClientRequestDto = {
      name: 'Acme',
      id: clientId,
      dataStore: {
        entity: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: [entityStorePublicKey]
        },
        policy: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: [policyStorePublicKey]
        }
      }
    }

    it('creates a new client with a default policy engines', async () => {
      mockPolicyEngineServer(configService.get('policyEngine.url'), clientId)

      const { status, body } = await request(app.getHttpServer()).post('/clients').send(createClientPayload)

      const actualClient = await clientService.findById(body.id)

      expect(body).toEqual({
        ...actualClient,
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })

      expect(actualClient?.dataStore.entityPublicKey).toEqual(createClientPayload.dataStore.entity.keys[0])
      expect(actualClient?.dataStore.policyPublicKey).toEqual(createClientPayload.dataStore.policy.keys[0])

      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new client with given policy engines', async () => {
      const policyEngineNode = 'http://mock.test/test-data-store'

      mockPolicyEngineServer(policyEngineNode, clientId)

      const createClientWithGivenPolicyEngine: CreateClientRequestDto = {
        ...createClientPayload,
        policyEngineNodes: [policyEngineNode]
      }

      const { body } = await request(app.getHttpServer()).post('/clients').send(createClientWithGivenPolicyEngine)

      const actualClient = await clientService.findById(body.id)

      expect(actualClient?.policyEngine.nodes[0].url).toEqual(policyEngineNode)
    })

    it('responds with bad request when payload is invalid', async () => {
      const { status } = await request(app.getHttpServer()).post('/clients').send({})

      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it.todo('responds with forbidden when admin api key is missing')
    it.todo('responds with forbidden when admin api key is invalid')
  })
})
