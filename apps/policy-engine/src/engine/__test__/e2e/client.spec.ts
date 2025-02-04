import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import {
  LoggerModule,
  OpenTelemetryModule,
  REQUEST_HEADER_ADMIN_API_KEY,
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET,
  secret
} from '@narval/nestjs-shared'
import { DataStoreConfiguration, HttpSource, SourceType } from '@narval/policy-engine-shared'
import {
  PrivateKey,
  privateKeyToHex,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { CreateClientRequestDto } from '../../../client/http/rest/dto/create-client.dto'
import { ClientRepository } from '../../../client/persistence/repository/client.repository'
import { PolicyEngineModule } from '../../../policy-engine.module'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client } from '../../../shared/type/domain.type'
import { ProvisionService } from '../../core/service/provision.service'

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let clientRepository: ClientRepository
  let clientService: ClientService
  let dataStoreConfiguration: DataStoreConfiguration
  let createClientPayload: CreateClientRequestDto

  const adminApiKey = 'test-admin-api-key'

  const clientId = uuid()

  const dataStoreSource: HttpSource = {
    type: SourceType.HTTP,
    url: 'http://127.0.0.1:9999/test-data-store'
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PolicyEngineModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideModule(OpenTelemetryModule)
      .useModule(OpenTelemetryModule.forTest())
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()

    clientService = module.get<ClientService>(ClientService)
    clientRepository = module.get<ClientRepository>(ClientRepository)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    const jwk = secp256k1PrivateKeyToJwk(generatePrivateKey())

    dataStoreConfiguration = {
      data: dataStoreSource,
      signature: dataStoreSource,
      keys: [jwk]
    }

    createClientPayload = {
      clientId,
      entityDataStore: dataStoreConfiguration,
      policyDataStore: dataStoreConfiguration
    }

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    const provisionService = module.get<ProvisionService>(ProvisionService)
    await provisionService.provision(secret.hash(adminApiKey))

    jest.spyOn(clientService, 'syncDataStore').mockResolvedValue(true)
  })

  describe('POST /clients', () => {
    it('creates a new client', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(createClientPayload)

      const actualClient = await clientRepository.findById(clientId)
      const hex = await privateKeyToHex(actualClient?.decisionAttestation.signer?.privateKey as PrivateKey)
      const actualPublicKey = secp256k1PrivateKeyToPublicJwk(hex)

      expect(body).toEqual({
        ...actualClient,
        auth: {
          disabled: false,
          local: {
            clientSecret: expect.any(String)
          }
        },
        decisionAttestation: {
          ...actualClient?.decisionAttestation,
          signer: {
            publicKey: actualPublicKey,
            alg: actualClient?.decisionAttestation.signer?.alg,
            keyId: actualClient?.decisionAttestation.signer?.keyId
          }
        },
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new client with a given secret', async () => {
      const clientSecret = 'test-client-secret'

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send({ ...createClientPayload, clientSecret })

      expect(body.auth.local?.clientSecret).toEqual(clientSecret)
    })

    it('creates a new client with engine key in the entity and policy keys for self-signed data', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send({ ...createClientPayload, allowSelfSignedData: true })

      const actualClient = await clientRepository.findById(clientId)
      const hex = await privateKeyToHex(actualClient?.decisionAttestation.signer?.privateKey as PrivateKey)
      const actualPublicKey = secp256k1PrivateKeyToPublicJwk(hex)

      expect(body).toEqual({
        ...actualClient,
        auth: {
          disabled: false,
          local: {
            clientSecret: expect.any(String)
          }
        },
        decisionAttestation: {
          ...actualClient?.decisionAttestation,
          signer: {
            publicKey: actualPublicKey,
            alg: actualClient?.decisionAttestation.signer?.alg,
            keyId: actualClient?.decisionAttestation.signer?.keyId
          }
        },
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)

      expect(actualClient?.dataStore.entity.keys).toEqual([
        ...createClientPayload.entityDataStore.keys,
        actualPublicKey
      ])
      expect(actualClient?.dataStore.policy.keys).toEqual([
        ...createClientPayload.policyDataStore.keys,
        actualPublicKey
      ])
    })

    it('does not expose the signer private key', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(createClientPayload)

      expect(body.decisionAttestation.signer.privateKey).not.toBeDefined()
      // The JWK private key is stored in the key's `d` property.
      // See also https://datatracker.ietf.org/doc/html/rfc7517#appendix-A.2
      expect(body.decisionAttestation.signer.publicKey.d).not.toBeDefined()
    })

    it('responds with an error when clientId already exist', async () => {
      await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(createClientPayload)

      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send(createClientPayload)

      expect(body).toEqual({
        message: 'Client already exist',
        statusCode: HttpStatus.BAD_REQUEST
      })
      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it('responds with forbidden when admin api key is invalid', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, 'invalid-api-key')
        .send(createClientPayload)

      expect(body).toMatchObject({
        message: 'Forbidden resource',
        statusCode: HttpStatus.FORBIDDEN
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })
  })

  describe('POST /clients/sync', () => {
    let client: Client

    beforeEach(async () => {
      jest.spyOn(clientService, 'syncDataStore').mockResolvedValue(true)

      const { body } = await request(app.getHttpServer())
        .post('/clients')
        .set(REQUEST_HEADER_ADMIN_API_KEY, adminApiKey)
        .send({
          ...createClientPayload,
          clientId: uuid()
        })

      client = body
    })

    it('calls the client data store sync', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/clients/sync')
        .set(REQUEST_HEADER_CLIENT_ID, client.clientId)
        .set(REQUEST_HEADER_CLIENT_SECRET, client.auth.local?.clientSecret || '')

      expect(body).toEqual({ success: true })
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
