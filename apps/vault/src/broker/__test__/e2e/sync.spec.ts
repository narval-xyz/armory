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
import {
  ANCHORAGE_TEST_API_BASE_URL,
  setupMockServer
} from '../../core/service/__test__/integration/mocks/anchorage/server'
import { AnchorageSyncService } from '../../core/service/anchorage-sync.service'
import { ConnectionService } from '../../core/service/connection.service'
import { SyncService } from '../../core/service/sync.service'
import { ActiveConnectionWithCredentials, PendingConnection, Provider } from '../../core/type/connection.type'
import { SyncStatus } from '../../core/type/sync.type'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('Sync', () => {
  let app: INestApplication
  let module: TestingModule
  let syncService: SyncService
  let connectionService: ConnectionService
  let testPrismaService: TestPrismaService
  let anchorageSyncServiceMock: MockProxy<AnchorageSyncService>
  let provisionService: ProvisionService
  let clientService: ClientService

  let activeConnection: ActiveConnectionWithCredentials
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let pendingConnection: PendingConnection

  const url = ANCHORAGE_TEST_API_BASE_URL

  const apiKey = 'test-api-key'

  const clientId = testClient.clientId

  setupMockServer()

  beforeAll(async () => {
    // We mock the provider's sync service here to prevent race conditions
    // during the tests. This is because the SyncService sends a promise to
    // start the sync but does not wait for it to complete.
    //
    // NOTE: The sync logic is tested in the provider's sync service
    // integration tests.
    anchorageSyncServiceMock = mock<AnchorageSyncService>()
    anchorageSyncServiceMock.sync.mockResolvedValue()

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
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
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

    pendingConnection = await connectionService.initiate(clientId, {
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
    it('dispatches the sync to the provider specific service', async () => {
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

      expect(anchorageSyncServiceMock.sync).toHaveBeenCalledTimes(1)
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

      expect(body).toMatchObject({
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

      expect(body).toEqual({
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

      expect(body).toMatchObject({
        clientId: sync.clientId,
        connectionId: sync.connectionId,
        createdAt: sync.createdAt.toISOString(),
        syncId: sync.syncId,
        // In between the calling `start` and sending the request, the sync
        // status changed from `processing` to `success`.
        status: SyncStatus.SUCCESS
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
        syncs: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            // In between the calling `start` and sending the request, the sync
            // status changed from `processing` to `success`.
            status: SyncStatus.SUCCESS
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.syncs.length).toEqual(1)
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
        syncs: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: SyncStatus.SUCCESS
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.syncs.length).toEqual(1)
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

      expect(body.syncs.length).toEqual(1)
      expect(body.page).toHaveProperty('next')
    })
  })
})
