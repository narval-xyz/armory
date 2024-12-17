import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import {
  Alg,
  Ed25519PrivateKey,
  ed25519PublicKeySchema,
  generateJwk,
  getPublicKey,
  privateKeyToHex,
  rsaEncrypt,
  rsaPublicKeySchema
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { times } from 'lodash'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ZodSchema } from 'zod'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { ConnectionService } from '../../core/service/connection.service'
import { ConnectionStatus, Provider, isActiveConnection, isRevokedConnection } from '../../core/type/connection.type'
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

const toMatchZodSchema = (received: unknown, schema: ZodSchema): void => {
  const parse = schema.safeParse(received)

  if (parse.success) {
    return
  }

  const message = [
    'Expected value to match schema:',
    'Received:',
    `${JSON.stringify(received, null, 2)}`,
    'Validation errors:',
    parse.error.errors.map((err) => `- ${err.message}`).join('\n')
  ].join('\n')

  throw new Error(message)
}

describe('Connection', () => {
  let app: INestApplication
  let module: TestingModule
  let connectionService: ConnectionService
  let encryptionKeyService: EncryptionKeyService
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

  const url = 'http://provider.narval.xyz'

  const userPrivateJwk = testUserPrivateJwk
  const client = testClient
  const clientId = testClient.clientId

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    connectionService = module.get(ConnectionService)
    encryptionKeyService = module.get(EncryptionKeyService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)

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

      expect(body).toMatchObject({
        clientId,
        connectionId: connection.connectionId,
        provider: connection.provider,
        status: ConnectionStatus.PENDING
      })

      expect(body.credentials.privateKey).toEqual(undefined)

      toMatchZodSchema(body.credentials.publicKey, ed25519PublicKeySchema)
      toMatchZodSchema(body.encryptionPublicKey, rsaPublicKeySchema)

      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /provider/connections', () => {
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

      const createdConnection = await connectionService.findById(clientId, connection.connectionId, true)

      expect(body).toEqual({
        clientId,
        connectionId,
        url,
        createdAt: expect.any(String),
        label: connection.label,
        provider: connection.provider,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(String)
      })

      expect(status).toEqual(HttpStatus.CREATED)

      expect(createdConnection).toMatchObject({
        clientId,
        credentials: {
          apiKey: connection.credentials.apiKey,
          privateKey,
          publicKey: getPublicKey(privateKey as Ed25519PrivateKey)
        },
        createdAt: expect.any(Date),
        connectionId,
        label: connection.label,
        provider: connection.provider,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date),
        url: connection.url
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

      expect(body).toEqual({
        clientId,
        connectionId,
        label,
        provider,
        url,
        createdAt: expect.any(String),
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionService.findById(clientId, connectionId, true)

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

      if (isActiveConnection(createdConnection)) {
        expect(createdConnection.credentials).toMatchObject({
          apiKey: credentials.apiKey,
          publicKey: pendingConnection.credentials.publicKey
        })
      } else {
        fail('expected an active connection')
      }
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

      const encryptedCredentials = await rsaEncrypt(JSON.stringify(credentials), pendingConnection.encryptionPublicKey)

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
        clientId,
        connectionId,
        label,
        provider,
        url,
        createdAt: expect.any(String),
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionService.findById(clientId, connectionId, true)

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

      if (isActiveConnection(createdConnection)) {
        expect(createdConnection.credentials).toMatchObject({
          apiKey: credentials.apiKey,
          publicKey: pendingConnection.credentials.publicKey
        })
      } else {
        fail('expected an active connection')
      }
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

      const updatedConnection = await connectionService.findById(clientId, connection.connectionId, true)

      if (isRevokedConnection(updatedConnection)) {
        expect(updatedConnection.credentials).toEqual(null)
        expect(updatedConnection.revokedAt).toEqual(expect.any(Date))
      } else {
        fail('expected a revoked connection')
      }
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

      expect(body.connections.length).toEqual(3)

      expect(body.connections[0]).toMatchObject({
        clientId,
        url,
        connectionId: expect.any(String),
        createdAt: expect.any(String),
        label: expect.any(String),
        provider: Provider.ANCHORAGE,
        updatedAt: expect.any(String)
      })
      expect(body.connections[0]).not.toHaveProperty('credentials')

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

      expect(body.connections.length).toEqual(1)
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
        .get('/provider/connections')
        .query({
          limit: 1,
          cursor: pageOne.page.next
        })
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

      expect(pageTwo.connections.length).toEqual(1)
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

      expect(body).toMatchObject({
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
      const encryptionKey = await encryptionKeyService.generate(clientId, { modulusLength: 2048 })
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

      expect(body).toMatchObject({ label: 'new label' })
      expect(body).not.toHaveProperty('credentials')

      expect(status).toEqual(HttpStatus.OK)

      const updatedConnection = await connectionService.findById(clientId, connection.connectionId, true)

      expect(updatedConnection.credentials?.apiKey).toEqual(newCredentials.apiKey)
      expect(updatedConnection.credentials?.privateKey).toEqual(newPrivateKey)
      expect(updatedConnection.credentials?.publicKey).toEqual(getPublicKey(newPrivateKey as Ed25519PrivateKey))
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

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toMatchObject({
        wallets: [getExpectedWallet(TEST_WALLETS[0])],
        page: {}
      })
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

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toMatchObject({
        wallets: [],
        page: {}
      })
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

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toMatchObject({
        accounts: accountsForConnection.map(getExpectedAccount),
        page: {}
      })
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

      expect(status).toEqual(HttpStatus.OK)
      expect(body).toMatchObject({
        accounts: [],
        page: {}
      })
    })
  })
})
