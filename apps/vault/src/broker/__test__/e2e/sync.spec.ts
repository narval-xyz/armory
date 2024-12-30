import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../../core/provider/anchorage/__test__/server-mock/server'
import { AnchorageSyncService } from '../../core/provider/anchorage/anchorage-sync.service'
import { ConnectionService } from '../../core/service/connection.service'
import { SyncService } from '../../core/service/sync.service'
import { ActiveConnectionWithCredentials, Provider } from '../../core/type/connection.type'
import { SyncStatus } from '../../core/type/sync.type'
import { setupMockServer } from '../../shared/__test__/mock-server'
import { SyncStartedEvent } from '../../shared/event/sync-started.event'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('Sync', () => {
  let app: INestApplication
  let module: TestingModule

  let eventEmitterMock: MockProxy<EventEmitter2>
  let syncService: SyncService
  let connectionService: ConnectionService
  let testPrismaService: TestPrismaService
  let anchorageSyncServiceMock: MockProxy<AnchorageSyncService>
  let provisionService: ProvisionService
  let clientService: ClientService
  let activeConnection: ActiveConnectionWithCredentials

  const url = ANCHORAGE_TEST_API_BASE_URL

  const apiKey = 'test-api-key'

  const clientId = testClient.clientId

  setupMockServer(getHandlers())

  beforeAll(async () => {
    // NOTE: The sync logic is tested in the provider's sync service and the
    // sync service integration tests.

    eventEmitterMock = mock<EventEmitter2>()
    eventEmitterMock.emit.mockReturnValue(true)

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
      .overrideProvider(AnchorageSyncService)
      .useValue(anchorageSyncServiceMock)
      .overrideProvider(EventEmitter2)
      .useValue(eventEmitterMock)
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)
    syncService = module.get(SyncService)
    connectionService = module.get(ConnectionService)

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
    await clientService.save(testClient)

    activeConnection = await connectionService.create(clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE,
      url,
      credentials: {
        apiKey,
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    await connectionService.initiate(clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE
    })

    await app.init()
  })

  describe('POST /syncs', () => {
    // This test ensures that the sync process is correctly wired.
    // Since the mock is created in the `beforeAll` block, it maintains a
    // single state throughout the entire test lifecycle. Therefore, changing
    // the order of this test will affect how many times the `sync` function is
    // called.
    it('emits sync.started event on syncs start', async () => {
      await request(app.getHttpServer())
        .post('/provider/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/syncs',
            payload: {},
            htm: 'POST'
          })
        )
        .send()

      const { data: syncs } = await syncService.findAll(clientId)

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        SyncStartedEvent.EVENT_NAME,
        new SyncStartedEvent(syncs[0], activeConnection)
      )
    })

    it('starts a sync on every active connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/provider/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/syncs',
            payload: {},
            htm: 'POST'
          })
        )
        .send()

      const syncs = await syncService.findAll(clientId)
      const [sync] = syncs.data

      expect(body.data).toMatchObject({
        started: true,
        syncs: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: SyncStatus.PROCESSING
          }
        ]
      })

      expect(status).toEqual(HttpStatus.CREATED)

      expect(syncs.data.length).toEqual(1)
    })

    it('starts a sync on the given connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/provider/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/syncs',
            payload: { connectionId: activeConnection.connectionId },
            htm: 'POST'
          })
        )
        .send({ connectionId: activeConnection.connectionId })

      const syncs = await syncService.findAll(clientId)
      const [sync] = syncs.data

      expect(body.data).toEqual({
        started: true,
        syncs: [
          {
            clientId: sync.clientId,
            connectionId: activeConnection.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: SyncStatus.PROCESSING
          }
        ]
      })

      expect(status).toEqual(HttpStatus.CREATED)

      expect(syncs.data.length).toEqual(1)
    })
  })

  describe('GET /syncs/:syncId', () => {
    it('responds with the specific sync', async () => {
      const { syncs } = await syncService.start([activeConnection])
      const [sync] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/syncs/${sync.syncId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/syncs/${sync.syncId}`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body.data).toMatchObject({
        clientId: sync.clientId,
        connectionId: sync.connectionId,
        createdAt: sync.createdAt.toISOString(),
        syncId: sync.syncId,
        status: SyncStatus.PROCESSING
      })

      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /syncs', () => {
    it('responds with a list of syncs', async () => {
      const { syncs } = await syncService.start([activeConnection])
      const [sync] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get('/provider/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/syncs',
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: SyncStatus.PROCESSING
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.data.length).toEqual(1)
    })

    it('responds with the specific sync filter by connection', async () => {
      const { syncs } = await syncService.start([activeConnection])
      const [sync] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get('/provider/syncs')
        .query({ connectionId: sync.connectionId })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/syncs?connectionId=${sync.connectionId}`,
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        data: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: SyncStatus.PROCESSING
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.data.length).toEqual(1)
    })

    it('responds with limited number of syncs when limit is given', async () => {
      await syncService.start([activeConnection])

      const { body } = await request(app.getHttpServer())
        .get('/provider/syncs')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/syncs?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
        .send()

      expect(body.data.length).toEqual(1)
      expect(body.page).toHaveProperty('next')
    })
  })
})
