import { ConfigModule } from '@narval/config-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import nock from 'nock'
import request from 'supertest'
import { load } from '../../../main.config'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/decorator/connection-id.decorator'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { BrokerModule } from '../../broker.module'
import { ConnectionService } from '../../core/service/connection.service'
import { Provider } from '../../core/type/connection.type'

describe('Proxy', () => {
  let app: INestApplication
  let module: TestingModule
  let connectionService: ConnectionService
  let testPrismaService: TestPrismaService

  const TEST_CLIENT_ID = 'test-client-id'
  const TEST_CONNECTION_ID = 'test-connection-id'
  const MOCK_API_URL = 'https://api.anchorage-staging.com'

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
    nock.cleanAll()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    // Clean any pending nock interceptors
    nock.cleanAll()

    // Create a test connection
    await connectionService.create(TEST_CLIENT_ID, {
      connectionId: TEST_CONNECTION_ID,
      label: 'test connection',
      provider: Provider.ANCHORAGE,
      url: MOCK_API_URL,
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })
  })

  it('forwards GET request', async () => {
    nock(MOCK_API_URL).get('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .get('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.OK)
  })

  it('forwards POST request', async () => {
    nock(MOCK_API_URL).post('/v2/wallets').reply(201, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .post('/proxy/v2/wallets')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send({ test: 'data' })

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.CREATED)
  })

  it('forwards DELETE request', async () => {
    nock(MOCK_API_URL).delete('/v2/vaults').reply(204)

    const response = await request(app.getHttpServer())
      .delete('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(response.status).toBe(HttpStatus.NO_CONTENT)
  })

  it('forwards PUT request', async () => {
    nock(MOCK_API_URL).put('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .put('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send({ test: 'data' })

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.OK)
  })

  it('forwards PATCH request', async () => {
    nock(MOCK_API_URL).patch('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .patch('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send({ test: 'data' })

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.OK)
  })

  it('adds api-key header', async () => {
    let capturedHeaders: Record<string, string> = {}

    nock(MOCK_API_URL)
      .get('/v2/vaults')
      .reply(function () {
        capturedHeaders = this.req.headers
        return [200, { data: 'mock response' }]
      })

    await request(app.getHttpServer())
      .get('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(capturedHeaders['api-access-key']).toBe('test-api-key')
  })

  it(`doesn't leak client-id header`, async () => {
    let capturedHeaders: Record<string, string> = {}

    nock(MOCK_API_URL)
      .get('/v2/vaults')
      .reply(function () {
        capturedHeaders = this.req.headers
        return [200, { data: 'mock response' }]
      })

    await request(app.getHttpServer())
      .get('/v1/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(capturedHeaders[REQUEST_HEADER_CLIENT_ID.toLowerCase()]).toBeUndefined()
  })

  it(`doesn't leak connection-id header`, async () => {
    let capturedHeaders: Record<string, string> = {}

    nock(MOCK_API_URL)
      .get('/v2/vaults')
      .reply(function () {
        capturedHeaders = this.req.headers
        return [200, { data: 'mock response' }]
      })

    await request(app.getHttpServer())
      .get('/v1/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(capturedHeaders[REQUEST_HEADER_CONNECTION_ID.toLowerCase()]).toBeUndefined()
  })

  it(`doesn't tamper with the error response`, async () => {
    nock(MOCK_API_URL).get('/v2/vaults').reply(512, { error: 'mock error' }, { 'x-custom-header': 'custom value' })

    const response = await request(app.getHttpServer())
      .get('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(response.body).toEqual({ error: 'mock error' })
    expect(response.status).toBe(512)
    expect(response.header['x-custom-header']).toBe('custom value')
  })

  it('throws a connection invalid exception when the connection is not active', async () => {
    await connectionService.revoke(TEST_CLIENT_ID, TEST_CONNECTION_ID)

    const response = await request(app.getHttpServer())
      .get('/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .send()

    expect(response.body).toEqual({
      message: 'Connection is not active',
      context: { connectionId: TEST_CONNECTION_ID, clientId: TEST_CLIENT_ID, status: 'revoked' },
      stack: expect.any(String),
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
  })
})
