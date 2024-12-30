import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import nock from 'nock'
import { EncryptionModuleOptionProvider } from 'packages/encryption-module/src/lib/encryption.module'
import request from 'supertest'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/decorator/connection-id.decorator'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { ConnectionService } from '../../core/service/connection.service'
import { Provider } from '../../core/type/connection.type'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('Proxy', () => {
  let app: INestApplication
  let module: TestingModule
  let connectionService: ConnectionService
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

  const TEST_CLIENT_ID = 'test-client-id'
  const TEST_CONNECTION_ID = 'test-connection-id'
  const MOCK_API_URL = 'https://api.anchorage-staging.com'

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
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()
    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)
    await testPrismaService.truncateAll()
    connectionService = module.get(ConnectionService)
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

    await provisionService.provision()
    await clientService.save(testClient)

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

    await app.init()
  })

  it('forwards GET request', async () => {
    nock(MOCK_API_URL).get('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )

    expect(response.status).toBe(HttpStatus.OK)
    expect(response.body).toEqual({ data: 'mock response' })
  })

  it('forwards POST request', async () => {
    nock(MOCK_API_URL).post('/v2/wallets').reply(201, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .post('/provider/proxy/v2/wallets')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/wallets',
          payload: { test: 'data' },
          htm: 'POST'
        })
      )
      .send({ test: 'data' })

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.CREATED)
  })

  it('forwards DELETE request', async () => {
    nock(MOCK_API_URL).delete('/v2/vaults').reply(204)

    const response = await request(app.getHttpServer())
      .delete('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'DELETE'
        })
      )
      .send()

    expect(response.status).toBe(HttpStatus.NO_CONTENT)
  })

  it('forwards PUT request', async () => {
    nock(MOCK_API_URL).put('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .put('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: { test: 'data' },
          htm: 'PUT'
        })
      )
      .send({ test: 'data' })

    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.OK)
  })

  it('forwards PATCH request', async () => {
    nock(MOCK_API_URL).patch('/v2/vaults').reply(200, { data: 'mock response' })

    const response = await request(app.getHttpServer())
      .patch('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: { test: 'data' },
          htm: 'PATCH'
        })
      )
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
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )
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
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )
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
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )
      .send()

    expect(capturedHeaders[REQUEST_HEADER_CONNECTION_ID.toLowerCase()]).toBeUndefined()
  })

  it(`doesn't tamper with the error response`, async () => {
    nock(MOCK_API_URL).get('/v2/vaults').reply(512, { error: 'mock error' }, { 'x-custom-header': 'custom value' })

    const response = await request(app.getHttpServer())
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )
      .send()

    expect(response.body).toEqual({ error: 'mock error' })
    expect(response.status).toBe(512)
    expect(response.header['x-custom-header']).toBe('custom value')
  })

  it('throws a connection invalid exception when the connection is not active', async () => {
    await connectionService.revoke(TEST_CLIENT_ID, TEST_CONNECTION_ID)

    const response = await request(app.getHttpServer())
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )
      .send()

    expect(response.body).toEqual({
      message: 'Connection is not active',
      context: { connectionId: TEST_CONNECTION_ID, clientId: TEST_CLIENT_ID, status: 'revoked' },
      stack: expect.any(String),
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
  })

  it('correctly forwards response headers without conflicts', async () => {
    nock(MOCK_API_URL).get('/v2/vaults').reply(
      200,
      { data: 'mock response' },
      {
        'transfer-encoding': 'chunked'
      }
    )

    const response = await request(app.getHttpServer())
      .get('/provider/proxy/v2/vaults')
      .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      .set(REQUEST_HEADER_CONNECTION_ID, TEST_CONNECTION_ID)
      .set(
        'detached-jws',
        await getJwsd({
          userPrivateJwk: testUserPrivateJwk,
          requestUrl: '/provider/proxy/v2/vaults',
          payload: {},
          htm: 'GET'
        })
      )

    // If there's a header conflict, nock will throw before we get here
    expect(response.body).toEqual({ data: 'mock response' })
    expect(response.status).toBe(HttpStatus.OK)
  })
})
