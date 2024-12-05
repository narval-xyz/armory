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
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ZodSchema } from 'zod'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { BrokerModule } from '../../broker.module'
import { ConnectionStatus, Provider } from '../../core/type/connection.type'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'

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
  let connectionRepository: ConnectionRepository
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
    connectionRepository = module.get(ConnectionRepository)

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

      toMatchZodSchema(body.publicKey, ed25519PublicKeySchema)
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

      const createdConnection = await connectionRepository.findById(clientId, connection.connectionId)

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
        id: connectionId,
        integrity: expect.any(String),
        label: connection.label,
        provider: connection.provider,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date),
        url: connection.url
      })
    })

    it('activates an anchorage pending connection with plain credentials', async () => {
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

      const { status, body } = await request(app.getHttpServer())
        .post('/connections')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send({
          provider,
          connectionId,
          label,
          url,
          credentials
        })

      expect(body).toEqual({
        clientId,
        connectionId,
        status: ConnectionStatus.ACTIVE
      })
      expect(status).toEqual(HttpStatus.CREATED)

      const createdConnection = await connectionRepository.findById(clientId, connectionId)

      expect(createdConnection).toMatchObject({
        clientId,
        createdAt: expect.any(Date),
        id: connectionId,
        integrity: expect.any(String),
        label,
        provider,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date),
        url
      })

      expect(createdConnection.credentials).toMatchObject({
        apiKey: credentials.apiKey,
        publicKey: pendingConnection.publicKey
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

      const createdConnection = await connectionRepository.findById(clientId, connectionId)

      expect(createdConnection).toMatchObject({
        clientId,
        createdAt: expect.any(Date),
        id: connectionId,
        integrity: expect.any(String),
        label,
        provider,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date),
        url
      })

      expect(createdConnection.credentials).toMatchObject({
        apiKey: credentials.apiKey,
        publicKey: pendingConnection.publicKey
      })
    })
  })
})
