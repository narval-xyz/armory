import { ConfigModule } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, Ed25519PrivateKey, generateJwk, getPublicKey, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { BrokerModule } from '../../broker.module'
import { ConnectionStatus, Provider } from '../../core/type/connection.type'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'

describe('Connection', () => {
  let app: INestApplication
  let module: TestingModule
  let connectionRepository: ConnectionRepository
  let testPrismaService: TestPrismaService

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
    })
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

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

  describe('POST /connections', () => {
    it('creates a new connection to anchorage', async () => {
      const privateKey = await generateJwk(Alg.EDDSA)
      const privateKeyHex = await privateKeyToHex(privateKey)
      const clientId = 'test-client-id'
      const connection = {
        provider: Provider.ANCHORAGE,
        connectionId: 'test-connection-id',
        label: 'Test Anchorage Connection',
        url: 'http://provider.narval.xyz',
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
        connectionId: connection.connectionId,
        clientId
      })
      expect(body.credentials).toEqual(undefined)

      expect(status).toEqual(HttpStatus.CREATED)

      expect(createdConnection).toMatchObject({
        clientId,
        credentials: {
          apiKey: connection.credentials.apiKey,
          privateKey,
          publicKey: getPublicKey(privateKey as Ed25519PrivateKey)
        },
        createdAt: expect.any(Date),
        id: connection.connectionId,
        integrity: expect.any(String),
        label: connection.label,
        provider: connection.provider,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: expect.any(Date),
        url: connection.url
      })
    })
  })
})
