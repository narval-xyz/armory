import { ConfigModule, ConfigService } from '@narval/config-module'
import { LoggerModule, OpenTelemetryModule, secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration, HttpSource, PublicClient, Source, SourceType } from '@narval/policy-engine-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import nock from 'nock'
import request from 'supertest'
import { generatePrivateKey } from 'viem/accounts'
import { AppService } from '../../../app/core/service/app.service'
import { Config, load } from '../../../armory.config'
import { REQUEST_HEADER_API_KEY } from '../../../armory.constant'
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
    url: 'http://127.0.0.1:9999/test-data-store'
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

  nock(url).post('/v1/clients').reply(HttpStatus.CREATED, createClientResponse)
  nock(url).post('/v1/clients/sync').reply(HttpStatus.OK, { success: true })
}

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let clientService: ClientService
  let configService: ConfigService<Config>
  let testPrismaService: TestPrismaService
  let appService: AppService
  let policyEngineNodeUrl: string
  let managedDataStoreBaseUrl: string

  const clientId = 'test-client-id'

  const adminApiKey = 'test-admin-api-key'

  const entityStorePublicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))
  const entityStorePublicKey2 = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  const policyStorePublicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        OpenTelemetryModule.forTest(),
        ClientModule
      ]
    }).compile()

    app = module.createNestApplication()

    clientService = module.get(ClientService)
    configService = module.get(ConfigService)
    testPrismaService = module.get(TestPrismaService)
    appService = module.get(AppService)

    policyEngineNodeUrl = configService.get('policyEngine.nodes')[0].url
    managedDataStoreBaseUrl = configService.get('managedDataStoreBaseUrl')

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await appService.provision(secret.hash(adminApiKey))
  })

  describe('POST /clients', () => {
    const dataStoreSource: HttpSource = {
      type: SourceType.HTTP,
      url: 'http://127.0.0.1:9999/test-data-store'
    }

    const createClientPayload: CreateClientRequestDto = {
      id: clientId,
      name: 'Acme',
      dataStore: {
        entity: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: [entityStorePublicKey, entityStorePublicKey2] // test w/ 2 keys
        },
        policy: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: [policyStorePublicKey]
        }
      }
    }

    it('creates a new client with a default policy engines', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)

      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createClientPayload)

      const actualClient = await clientService.findById(body.id)

      const dataStore = {
        ...actualClient?.dataStore,
        entityDataUrl: dataStoreSource.url,
        policyDataUrl: dataStoreSource.url
      }

      expect(body).toEqual({
        ...actualClient,
        dataStore,
        clientSecret: expect.any(String),
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })

      expect(actualClient?.dataStore.entityPublicKeys).toEqual(createClientPayload.dataStore.entity.keys)
      expect(actualClient?.dataStore.policyPublicKeys).toEqual(createClientPayload.dataStore.policy.keys)

      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new client with given policy engines', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)
      mockPolicyEngineServer(policyEngineNodeUrl, clientId) // second mock is required because it gets called twice since we duplicate the url; test will fail if you delete this.

      const createClientWithGivenPolicyEngine: CreateClientRequestDto = {
        ...createClientPayload,
        policyEngineNodes: [policyEngineNodeUrl, policyEngineNodeUrl]
      }

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createClientWithGivenPolicyEngine)

      const actualClient = await clientService.findById(body.id)

      expect(actualClient?.policyEngine.nodes[0].url).toEqual(policyEngineNodeUrl)
    })

    it('creates a new client with a given secret', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)

      // When a client passes in a secret, they'll send it hashed already.
      const clientSecret = secret.hash('test-client-secret')

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({ ...createClientPayload, clientSecret })

      const actualClient = await clientService.findById(body.id)

      expect(body.clientSecret).toEqual(clientSecret) // Assert we have the same secret responded
      expect(actualClient?.clientSecret).toEqual(clientSecret) // assert the db actually stored the exact one passed, and did not re-hash the secret.
    })

    it('creates a new client with a generated secret, stored hashed', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send(createClientPayload)

      const actualClient = await clientService.findById(body.id)
      const hashedSecret = secret.hash(body.clientSecret)
      // Assert the plaintext was returned while the hashed was saved in db
      expect(hashedSecret).toEqual(actualClient?.clientSecret) // Assert we have the same secret responded
    })

    it('creates a new client with a managed data store', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({ ...createClientPayload, useManagedDataStore: true })

      const actualClient = await clientService.findById(body.id)
      const dataStore = {
        ...actualClient?.dataStore,
        entityDataUrl: `${managedDataStoreBaseUrl}/entities?clientId=${body.id}`,
        policyDataUrl: `${managedDataStoreBaseUrl}/policies?clientId=${body.id}`
      }

      expect(body).toEqual({
        ...actualClient,
        dataStore,
        dataSecret: null,
        clientSecret: expect.any(String),
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
    })

    it('creates a new client with engine key in entity and policy keys for self-signed data', async () => {
      mockPolicyEngineServer(policyEngineNodeUrl, clientId)

      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({
          ...createClientPayload,
          useManagedDataStore: true,
          dataStore: { ...createClientPayload.dataStore, allowSelfSignedData: true }
        })

      const actualClient = await clientService.findById(body.id)
      const dataStore = {
        ...actualClient?.dataStore,
        entityDataUrl: `${managedDataStoreBaseUrl}/entities?clientId=${body.id}`,
        policyDataUrl: `${managedDataStoreBaseUrl}/policies?clientId=${body.id}`
      }

      expect(body).toEqual({
        ...actualClient,
        dataStore,
        dataSecret: null,
        clientSecret: expect.any(String),
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(actualClient?.dataStore.entityPublicKeys).toEqual([
        ...createClientPayload.dataStore.entity.keys,
        body.policyEngine.nodes[0].publicKey
      ])
      expect(actualClient?.dataStore.policyPublicKeys).toEqual([
        ...createClientPayload.dataStore.policy.keys,
        body.policyEngine.nodes[0].publicKey
      ])

      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with unprocessable entity when payload is invalid', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, adminApiKey)
        .send({})

      expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY)
    })

    it('responds with forbidden when admin api key is invalid', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_API_KEY, 'invalid-admin-api-key')
        .send({})

      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })
  })
})
