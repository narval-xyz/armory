import { ConfigModule } from '@narval/config-module'
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
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { BrokerModule } from '../../broker.module'
import { ConnectionService } from '../../core/service/connection.service'
import { ConnectionStatus, Provider, isActiveConnection, isRevokedConnection } from '../../core/type/connection.type'

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
  let testPrismaService: TestPrismaService

  const url = 'http://provider.narval.xyz'

  const clientId = uuid()

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        BrokerModule
      ]
    }).compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    connectionService = module.get(ConnectionService)

    await testPrismaService.truncateAll()

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

  describe('POST /connections/initiate', () => {
    it('initiates a new connection to anchorage', async () => {
      const connection = {
        provider: Provider.ANCHORAGE,
        url,
        connectionId: uuid()
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
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

  describe('POST /connections', () => {
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
        .post('/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send(connection)

      const createdConnection = await connectionService.findById(clientId, connection.connectionId)

      expect(body).toEqual({
        connectionId,
        clientId,
        status: ConnectionStatus.ACTIVE
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
        integrity: expect.any(String),
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
        .post('/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send({ connectionId, provider })

      const { status, body } = await request(app.getHttpServer())
        .post('/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
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
        status: ConnectionStatus.ACTIVE
      })
      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionService.findById(clientId, connectionId)

      expect(createdConnection).toMatchObject({
        clientId,
        connectionId,
        label,
        provider,
        url,
        createdAt: expect.any(Date),
        integrity: expect.any(String),
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
        .post('/connections/initiate')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send({ connectionId, provider })

      const encryptedCredentials = await rsaEncrypt(JSON.stringify(credentials), pendingConnection.encryptionPublicKey)

      const { status, body } = await request(app.getHttpServer())
        .post('/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
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
        status: ConnectionStatus.ACTIVE
      })
      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionService.findById(clientId, connectionId)

      expect(createdConnection).toMatchObject({
        clientId,
        connectionId,
        label,
        provider,
        url,
        createdAt: expect.any(Date),
        integrity: expect.any(String),
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

  describe('DELETE /connections/:id', () => {
    it('revokes an existing connection', async () => {
      const connection = await connectionService.create(clientId, {
        connectionId: uuid(),
        label: 'test revoke connection',
        provider: Provider.ANCHORAGE,
        url,
        credentials: {
          apiKey: 'test-api-key',
          privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
        }
      })

      const { status } = await request(app.getHttpServer())
        .delete(`/connections/${connection.connectionId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(status).toEqual(HttpStatus.NO_CONTENT)

      const updatedConnection = await connectionService.findById(clientId, connection.connectionId)

      if (isRevokedConnection(updatedConnection)) {
        expect(updatedConnection.credentials).toEqual(null)
        expect(updatedConnection.revokedAt).toEqual(expect.any(Date))
      } else {
        fail('expected a revoked connection')
      }
    })
  })

  describe('GET /connections', () => {
    it('responds with connections from the given client', async () => {
      await Promise.all(
        times(3, async () =>
          connectionService.create(clientId, {
            connectionId: uuid(),
            label: 'test revoke connection',
            provider: Provider.ANCHORAGE,
            url,
            credentials: {
              apiKey: 'test-api-key',
              privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
            }
          })
        )
      )

      const { status, body } = await request(app.getHttpServer())
        .get('/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(body.connections.length).toEqual(3)

      expect(body.connections[0]).toMatchObject({
        connectionId: expect.any(String),
        integrity: expect.any(String),
        clientId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        label: 'test revoke connection',
        provider: Provider.ANCHORAGE,
        url
      })
      expect(body.connections[0]).not.toHaveProperty('credentials')

      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
