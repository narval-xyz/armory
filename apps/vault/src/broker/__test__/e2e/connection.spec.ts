import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { hexSchema } from '@narval/policy-engine-shared'
import {
  Alg,
  Ed25519PrivateKey,
  Hex,
  SMALLEST_RSA_MODULUS_LENGTH,
  ed25519PublicKeySchema,
  generateJwk,
  getPublicKey,
  privateKeyToHex,
  privateKeyToJwk,
  privateKeyToPem,
  rsaEncrypt,
  rsaPublicKeySchema
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { times } from 'lodash'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { AnchorageCredentialService } from '../../core/provider/anchorage/anchorage-credential.service'
import { ConnectionService } from '../../core/service/connection.service'
import { SyncService } from '../../core/service/sync.service'
import { ConnectionStatus } from '../../core/type/connection.type'
import { Provider } from '../../core/type/provider.type'
import { ConnectionActivatedEvent } from '../../shared/event/connection-activated.event'
import { getExpectedAccount, getExpectedWallet } from '../util/map-db-to-returned'
import {
  TEST_ACCOUNTS,
  TEST_CONNECTIONS,
  TEST_WALLETS,
  TEST_WALLET_CONNECTIONS,
  getJwsd,
  testClient,
  testUserPrivateJwk
} from '../util/mock-data'

import '../../shared/__test__/matcher'

describe('Connection', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let clientService: ClientService
  let connectionService: ConnectionService
  let encryptionKeyService: EncryptionKeyService
  let eventEmitterMock: MockProxy<EventEmitter2>
  let provisionService: ProvisionService

  const url = 'http://provider.narval.xyz'

  const userPrivateJwk = testUserPrivateJwk
  const client = testClient
  const clientId = testClient.clientId

  beforeAll(async () => {
    // We mock the sync service here to prevent race conditions
    // during the tests. This is because the ConnectionService sends a promise
    // to start the sync but does not wait for it to complete.
    const syncServiceMock = mock<SyncService>()
    syncServiceMock.start.mockResolvedValue({ started: true, syncs: [] })

    eventEmitterMock = mock<EventEmitter2>()
    eventEmitterMock.emit.mockReturnValue(true)

    module = await Test.createTestingModule({
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(SyncService)
      .useValue(syncServiceMock)
      .overrideProvider(EventEmitter2)
      .useValue(eventEmitterMock)
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()

    clientService = module.get(ClientService)
    connectionService = module.get(ConnectionService)
    encryptionKeyService = module.get(EncryptionKeyService)
    provisionService = module.get(ProvisionService)
    testPrismaService = module.get(TestPrismaService)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await provisionService.provision()

    await clientService.save(client)

    await app.init()
  })

  describe('POST /connections/initiate', () => {
    it('initiates a new connection to anchorage', async () => {
      const connection = {
        provider: Provider.ANCHORAGE,
        url,
        connectionId: uuid()
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/provider/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections/initiate',
            payload: connection
          })
        )
        .send(connection)

      const { data } = body

      expect(body).toMatchObject({
        data: {
          clientId,
          connectionId: connection.connectionId,
          provider: connection.provider,
          status: ConnectionStatus.PENDING
        }
      })

      // Ensure it doesn't leak the private key.
      expect(data.credentials).toEqual(undefined)
      expect(data.privateKey).toEqual(undefined)

      // Ensure it doesn't leak a private key as JWK by including the `d`
      // property.
      expect(data.publicKey.jwk).toMatchZodSchema(ed25519PublicKeySchema)
      expect(data.encryptionPublicKey.jwk).toMatchZodSchema(rsaPublicKeySchema)

      expect(data.publicKey.hex).toMatchZodSchema(hexSchema)

      expect(data.publicKey.keyId).toEqual(expect.any(String))
      expect(data.encryptionPublicKey.keyId).toEqual(expect.any(String))
      expect(data.encryptionPublicKey.pem).toEqual(expect.any(String)) // ensure we also respond w/ the PEM format.

      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /provider/connections', () => {
    it('emits connection.activated event on connection create', async () => {
      const privateKey = await generateJwk(Alg.EDDSA)
      const privateKeyHex = await privateKeyToHex(privateKey)
      const connectionId = uuid()
      const connection = {
        provider: Provider.ANCHORAGE,
        connectionId,
        label: 'Test Anchorage Connection',
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: privateKeyHex
        }
      }

      await request(app.getHttpServer())
        .post('/provider/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections',
            payload: connection
          })
        )
        .send(connection)

      const createdConnectionWithCredentials = await connectionService.findWithCredentialsById(
        clientId,
        connection.connectionId
      )

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        ConnectionActivatedEvent.EVENT_NAME,
        new ConnectionActivatedEvent(createdConnectionWithCredentials)
      )
    })

    it('emits connection.activated on connection activation', async () => {
      const connectionId = uuid()
      const provider = Provider.ANCHORAGE
      const label = 'Test Anchorage Connection'
      const credentials = { apiKey: 'test-api-key' }

      await request(app.getHttpServer())
        .post('/provider/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections/initiate',
            payload: { connectionId, provider }
          })
        )
        .send({ connectionId, provider })
        .expect(HttpStatus.CREATED)

      await request(app.getHttpServer())
        .post('/provider/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections',
            payload: {
              connectionId,
              credentials,
              label,
              provider,
              url
            }
          })
        )
        .send({
          connectionId,
          credentials,
          label,
          provider,
          url
        })
        .expect(HttpStatus.CREATED)

      const createdConnectionWithCredentials = await connectionService.findWithCredentialsById(clientId, connectionId)

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        ConnectionActivatedEvent.EVENT_NAME,
        new ConnectionActivatedEvent(createdConnectionWithCredentials)
      )
    })

    it('overrides the existing connection private key when providing a new one on pending connection activation', async () => {
      const connectionId = uuid()
      const provider = Provider.ANCHORAGE
      const label = 'Test Anchorage Connection'
      const credentials = {
        apiKey: 'test-api-key',
        // Adding private key to test override
        privateKey: '0x9ead9e0c93e9f4d02a09d4d3fdd35eac82452717a04ca98580302c16485b2480'
      }

      // First create a pending connection
      const { body: pendingConnection } = await request(app.getHttpServer())
        .post('/provider/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections/initiate',
            payload: { connectionId, provider }
          })
        )
        .send({ connectionId, provider })

      // Encrypt the credentials including the new private key
      const encryptedCredentials = await rsaEncrypt(
        JSON.stringify(credentials),
        pendingConnection.data.encryptionPublicKey.jwk
      )

      // Activate the connection with the new credentials
      const { status, body } = await request(app.getHttpServer())
        .post('/provider/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections',
            payload: {
              provider,
              connectionId,
              label,
              url,
              encryptedCredentials
            }
          })
        )
        .send({
          provider,
          connectionId,
          label,
          url,
          encryptedCredentials
        })

      expect(body).toEqual({
        data: {
          clientId,
          connectionId,
          label,
          provider,
          url,
          createdAt: expect.any(String),
          status: ConnectionStatus.ACTIVE,
          updatedAt: expect.any(String)
        }
      })

      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionService.findById(clientId, connectionId)
      const createdCredential = await connectionService.findCredentials(createdConnection)

      expect(createdConnection).toMatchObject({
        clientId,
        connectionId,
        label,
        provider,
        url,
        createdAt: expect.any(Date),
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date)
      })

      const givenPrivateKey = privateKeyToJwk(credentials.privateKey as Hex, AnchorageCredentialService.SIGNING_KEY_ALG)

      expect(createdCredential?.publicKey).toEqual(getPublicKey(givenPrivateKey))
      expect(createdCredential?.privateKey).toEqual(givenPrivateKey)
    })

    describe('anchorage', () => {
      it('creates a new connection to anchorage with plain credentials', async () => {
        const privateKey = await generateJwk(Alg.EDDSA)
        const privateKeyHex = await privateKeyToHex(privateKey)
        const connectionId = uuid()
        const connection = {
          provider: Provider.ANCHORAGE,
          connectionId,
          label: 'Test Anchorage Connection',
          url,
          credentials: {
            apiKey: 'test-api-key',
            privateKey: privateKeyHex
          }
        }

        const { status, body } = await request(app.getHttpServer())
          .post('/provider/connections')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections',
              payload: connection
            })
          )
          .send(connection)

        const createdConnection = await connectionService.findById(clientId, connection.connectionId)
        const createdCredentials = await connectionService.findCredentials(createdConnection)

        expect(body).toEqual({
          data: {
            clientId,
            connectionId,
            url,
            createdAt: expect.any(String),
            label: connection.label,
            provider: connection.provider,
            status: ConnectionStatus.ACTIVE,
            updatedAt: expect.any(String)
          }
        })

        expect(status).toEqual(HttpStatus.CREATED)

        expect(createdConnection).toMatchObject({
          clientId,
          createdAt: expect.any(Date),
          connectionId,
          label: connection.label,
          provider: connection.provider,
          status: ConnectionStatus.ACTIVE,
          updatedAt: expect.any(Date),
          url: connection.url
        })

        expect(createdCredentials).toEqual({
          apiKey: connection.credentials.apiKey,
          privateKey,
          publicKey: getPublicKey(privateKey as Ed25519PrivateKey)
        })
      })

      it('activates an anchorage pending connection with plain credentials', async () => {
        const connectionId = uuid()
        const provider = Provider.ANCHORAGE
        const label = 'Test Anchorage Connection'
        const credentials = { apiKey: 'test-api-key' }

        const { body: pendingConnection } = await request(app.getHttpServer())
          .post('/provider/connections/initiate')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections/initiate',
              payload: { connectionId, provider }
            })
          )
          .send({ connectionId, provider })

        const { status, body } = await request(app.getHttpServer())
          .post('/provider/connections')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections',
              payload: {
                connectionId,
                credentials,
                label,
                provider,
                url
              }
            })
          )
          .send({
            connectionId,
            credentials,
            label,
            provider,
            url
          })

        const createdConnection = await connectionService.findById(clientId, connectionId)
        const createdCredentials = await connectionService.findCredentials(createdConnection)

        expect(body).toEqual({
          data: {
            clientId,
            connectionId,
            label,
            provider,
            url,
            createdAt: expect.any(String),
            status: ConnectionStatus.ACTIVE,
            updatedAt: expect.any(String)
          }
        })
        expect(status).toEqual(HttpStatus.CREATED)

        expect(createdConnection).toMatchObject({
          clientId,
          connectionId,
          label,
          provider,
          url,
          createdAt: expect.any(Date),
          status: ConnectionStatus.ACTIVE,
          updatedAt: expect.any(Date)
        })

        expect(createdCredentials).toMatchObject({
          apiKey: credentials.apiKey,
          publicKey: pendingConnection.data.publicKey.jwk
        })
      })

      it('activates an anchorage pending connection with encrypted credentials', async () => {
        const connectionId = uuid()
        const provider = Provider.ANCHORAGE
        const label = 'Test Anchorage Connection'
        const credentials = {
          apiKey: 'test-api-key'
        }

        const { body: pendingConnection } = await request(app.getHttpServer())
          .post('/provider/connections/initiate')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections/initiate',
              payload: { connectionId, provider }
            })
          )
          .send({ connectionId, provider })

        const encryptedCredentials = await rsaEncrypt(
          JSON.stringify(credentials),
          pendingConnection.data.encryptionPublicKey.jwk
        )

        const { status, body } = await request(app.getHttpServer())
          .post('/provider/connections')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections',
              payload: {
                provider,
                connectionId,
                label,
                url,
                encryptedCredentials
              }
            })
          )
          .send({
            provider,
            connectionId,
            label,
            url,
            encryptedCredentials
          })

        expect(body).toEqual({
          data: {
            clientId,
            connectionId,
            label,
            provider,
            url,
            createdAt: expect.any(String),
            status: ConnectionStatus.ACTIVE,
            updatedAt: expect.any(String)
          }
        })
        expect(status).toEqual(HttpStatus.CREATED)

        const createdConnection = await connectionService.findById(clientId, connectionId)
        const createdCredentials = await connectionService.findCredentials(createdConnection)

        expect(createdConnection).toMatchObject({
          clientId,
          connectionId,
          label,
          provider,
          url,
          createdAt: expect.any(Date),
          status: ConnectionStatus.ACTIVE,
          updatedAt: expect.any(Date)
        })

        expect(createdCredentials).toMatchObject({
          apiKey: credentials.apiKey,
          publicKey: pendingConnection.data.publicKey.jwk
        })
      })
    })

    // NOTE: When adding tests for a new provider, focus only on testing
    // provider-specific credential formats. Common functionality like
    // credential encryption/decryption is already covered by existing tests.
    // The main goal is to verify that the API correctly handles the unique
    // input credential structure for each provider.
    describe('fireblocks', () => {
      it('creates a new connection to fireblocks with plain credentials', async () => {
        const rsaPrivateKey = await generateJwk(Alg.RS256, { modulusLength: SMALLEST_RSA_MODULUS_LENGTH })
        const pem = await privateKeyToPem(rsaPrivateKey, Alg.RS256)
        const connectionId = uuid()
        const connection = {
          provider: Provider.FIREBLOCKS,
          connectionId,
          label: 'Test Fireblocks Connection',
          url,
          credentials: {
            apiKey: 'test-api-key',
            privateKey: Buffer.from(pem).toString('base64')
          }
        }

        const { status, body } = await request(app.getHttpServer())
          .post('/provider/connections')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk,
              requestUrl: '/provider/connections',
              payload: connection
            })
          )
          .send(connection)

        const createdConnection = await connectionService.findById(clientId, connection.connectionId)
        const createdCredentials = await connectionService.findCredentials(createdConnection)

        expect(body).toEqual({
          data: {
            clientId,
            connectionId,
            url,
            createdAt: expect.any(String),
            label: connection.label,
            provider: connection.provider,
            status: ConnectionStatus.ACTIVE,
            updatedAt: expect.any(String)
          }
        })

        expect(status).toEqual(HttpStatus.CREATED)

        expect(createdConnection).toMatchObject({
          clientId,
          createdAt: expect.any(Date),
          connectionId,
          label: connection.label,
          provider: connection.provider,
          status: ConnectionStatus.ACTIVE,
          updatedAt: expect.any(Date),
          url: connection.url
        })

        expect(createdCredentials).toEqual({
          apiKey: connection.credentials.apiKey,
          privateKey: rsaPrivateKey,
          publicKey: getPublicKey(rsaPrivateKey)
        })
      })
    })
  })

  describe('DELETE /provider/connections/:id', () => {
    it('revokes an existing connection', async () => {
      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const { status } = await request(app.getHttpServer())
        .delete(`/provider/connections/${connection.connectionId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connection.connectionId}`,
            payload: {},
            htm: 'DELETE'
          })
        )
        .send()

      expect(status).toEqual(HttpStatus.NO_CONTENT)

      const updatedConnection = await connectionService.findById(clientId, connection.connectionId)
      const credentials = await connectionService.findCredentials(connection)

      expect(updatedConnection.revokedAt).toEqual(expect.any(Date))
      expect(updatedConnection.status).toEqual(ConnectionStatus.REVOKED)
      expect(credentials).toEqual(null)
    })
  })

  describe('GET /provider/connections', () => {
    beforeEach(async () => {
      await Promise.all(
        times(3, async () =>
          connectionService.create(clientId, {
            connectionId: uuid(),
            label: 'test connection',
            provider: Provider.ANCHORAGE,
            url,
            credentials: {
              apiKey: 'test-api-key',
              privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
            }
          })
        )
      )
    })

    it('responds with connections from the given client', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections',
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body.data.length).toEqual(3)

      expect(body.data[0]).toMatchObject({
        clientId,
        url,
        connectionId: expect.any(String),
        createdAt: expect.any(String),
        label: expect.any(String),
        provider: Provider.ANCHORAGE,
        updatedAt: expect.any(String)
      })
      expect(body.data[0]).not.toHaveProperty('credentials')

      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with limited number of syncs when limit is given', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/provider/connections')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body.data.length).toEqual(1)
      expect(body.page).toHaveProperty('next')
    })

    it('responds the next page of results when cursors is given', async () => {
      const { body: pageOne } = await request(app.getHttpServer())
        .get('/provider/connections')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: '/provider/connections?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      const { body: pageTwo } = await request(app.getHttpServer())
        .get(`/provider/connections?limit=1&cursor=${pageOne.page.next}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections?limit=1&cursor=${pageOne.page.next}`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(pageTwo.data.length).toEqual(1)
      expect(pageTwo.page).toHaveProperty('next')
    })

    it('throws error if the request was not signed', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/provider/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(status).toEqual(HttpStatus.UNAUTHORIZED)
    })
  })

  describe('GET /provider/connections/:connectionId', () => {
    it('responds with the specific connection', async () => {
      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/connections/${connection.connectionId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connection.connectionId}`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body.data).toMatchObject({
        connectionId: expect.any(String),
        clientId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url
      })
      expect(body).not.toHaveProperty('credentials')

      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('PATCH /provider/connections/:connectionId', () => {
    it('updates the given connection', async () => {
      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })
      const newPrivateKey = await generateJwk(Alg.EDDSA)
      const newCredentials = {
        apiKey: 'new-api-key',
        privateKey: await privateKeyToHex(newPrivateKey)
      }
      const encryptionKey = await encryptionKeyService.generate(clientId, {
        modulusLength: SMALLEST_RSA_MODULUS_LENGTH
      })
      const encryptedCredentials = await rsaEncrypt(JSON.stringify(newCredentials), encryptionKey.publicKey)

      const { status, body } = await request(app.getHttpServer())
        .patch(`/provider/connections/${connection.connectionId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connection.connectionId}`,
            payload: {
              label: 'new label',
              encryptedCredentials
            },
            htm: 'PATCH'
          })
        )
        .send({
          label: 'new label',
          encryptedCredentials
        })

      expect(body).toMatchObject({
        data: expect.objectContaining({
          label: 'new label'
        })
      })

      expect(body.data).not.toHaveProperty('credentials')

      expect(status).toEqual(HttpStatus.OK)

      const updatedConnection = await connectionService.findById(clientId, connection.connectionId)
      const updatedCredentials = await connectionService.findCredentials(updatedConnection)

      expect(updatedCredentials?.apiKey).toEqual(newCredentials.apiKey)
      expect(updatedCredentials?.privateKey).toEqual(newPrivateKey)
      expect(updatedCredentials?.publicKey).toEqual(getPublicKey(newPrivateKey as Ed25519PrivateKey))
    })
  })

  describe('GET /provider/connections/:connectionId/wallets', () => {
    it('responds with wallets for the specific connection', async () => {
      await testPrismaService.seedBrokerTestData()

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/connections/${TEST_CONNECTIONS[0].id}/wallets`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${TEST_CONNECTIONS[0].id}/wallets`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: [getExpectedWallet(TEST_WALLETS[0])],
        page: {}
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns empty array when connection has no wallets', async () => {
      await testPrismaService.seedBrokerTestData()

      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/connections/${connection.connectionId}/wallets`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connection.connectionId}/wallets`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: [],
        page: {}
      })
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /provider/connections/:connectionId/accounts', () => {
    it('responds with accounts for the specific connection', async () => {
      expect.assertions(2)
      await testPrismaService.seedBrokerTestData()

      // Assume connection[0] has some wallets which in turn have accounts.
      const connectionId = TEST_CONNECTIONS[0].id
      const walletsForConnection = TEST_WALLET_CONNECTIONS.filter((wc) => wc.connectionId === connectionId).map(
        (wc) => wc.walletId
      )

      const accountsForConnection = TEST_ACCOUNTS.filter((account) => walletsForConnection.includes(account.walletId))

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/connections/${connectionId}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connectionId}/accounts`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: accountsForConnection.map(getExpectedAccount).reverse(),
        page: {}
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns empty array when connection has no accounts', async () => {
      await testPrismaService.seedBrokerTestData()

      // Create a new connection that doesn't have any associated wallets or accounts
      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/connections/${connection.connectionId}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk,
            requestUrl: `/provider/connections/${connection.connectionId}/accounts`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: [],
        page: {}
      })
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
