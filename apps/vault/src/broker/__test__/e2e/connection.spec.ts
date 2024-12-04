import { ConfigModule } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { BrokerModule } from '../../broker.module'
import { Provider } from '../../core/type/connection.type'

describe('Connection', () => {
  let app: INestApplication
  let module: TestingModule
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

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

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

      expect(body).toEqual({
        connectionId: connection.connectionId,
        clientId
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
