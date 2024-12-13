import { ConfigModule } from '@narval/config-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { BrokerModule } from '../../broker.module'
import { ConnectionService } from '../../core/service/connection.service'
import { SyncService } from '../../core/service/sync.service'
import { ActiveConnection, PendingConnection, Provider } from '../../core/type/connection.type'

describe('Sync', () => {
  let app: INestApplication
  let module: TestingModule
  let syncService: SyncService
  let connectionService: ConnectionService
  let testPrismaService: TestPrismaService

  let activeConnectionOne: ActiveConnection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let activeConnectionTwo: ActiveConnection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let pendingConnection: PendingConnection

  const url = 'http://provider.narval.xyz'

  const apiKey = 'test-api-key'

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
    syncService = module.get(SyncService)
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

    activeConnectionOne = await connectionService.create(clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE,
      url,
      credentials: {
        apiKey,
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    activeConnectionTwo = await connectionService.create(clientId, {
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
  })

  describe('POST /syncs', () => {
    it('starts a sync on every active connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      const syncs = await syncService.findAllPaginated(clientId)
      const [syncOne, syncTwo] = syncs.data

      expect(body).toMatchObject({
        started: true,
        syncs: [
          {
            clientId: syncOne.clientId,
            connectionId: syncOne.connectionId,
            createdAt: syncOne.createdAt.toISOString(),
            syncId: syncOne.syncId,
            status: syncOne.status
          },
          {
            clientId: syncTwo.clientId,
            connectionId: syncTwo.connectionId,
            createdAt: syncTwo.createdAt.toISOString(),
            syncId: syncTwo.syncId,
            status: syncTwo.status
          }
        ]
      })

      expect(status).toEqual(HttpStatus.CREATED)

      expect(syncs.data.length).toEqual(2)
    })

    it('starts a sync on the given connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send({ connectionId: activeConnectionOne.connectionId })

      const syncs = await syncService.findAllPaginated(clientId)
      const [syncOne] = syncs.data

      expect(body).toEqual({
        started: true,
        syncs: [
          {
            clientId: syncOne.clientId,
            connectionId: activeConnectionOne.connectionId,
            createdAt: syncOne.createdAt.toISOString(),
            syncId: syncOne.syncId,
            status: syncOne.status
          }
        ]
      })

      expect(status).toEqual(HttpStatus.CREATED)

      expect(syncs.data.length).toEqual(1)
    })
  })

  describe('GET /syncs/:syncId', () => {
    it('responds with the specific sync', async () => {
      const { syncs } = await syncService.start({
        clientId,
        connectionId: activeConnectionOne.connectionId
      })
      const [sync] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get(`/syncs/${sync.syncId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(body).toMatchObject({
        clientId: sync.clientId,
        connectionId: sync.connectionId,
        createdAt: sync.createdAt.toISOString(),
        syncId: sync.syncId,
        status: sync.status
      })

      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /syncs', () => {
    it('responds with a list of syncs', async () => {
      const { syncs } = await syncService.start({ clientId })
      const [syncOne, syncTwo] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get('/syncs')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(body).toMatchObject({
        syncs: [
          {
            clientId: syncOne.clientId,
            connectionId: syncOne.connectionId,
            createdAt: syncOne.createdAt.toISOString(),
            syncId: syncOne.syncId,
            status: syncOne.status
          },
          {
            clientId: syncTwo.clientId,
            connectionId: syncTwo.connectionId,
            createdAt: syncTwo.createdAt.toISOString(),
            syncId: syncTwo.syncId,
            status: syncTwo.status
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.syncs.length).toEqual(2)
    })

    it('responds with the specific sync filter by connection', async () => {
      const { syncs } = await syncService.start({ clientId })
      const [sync] = syncs

      const { status, body } = await request(app.getHttpServer())
        .get('/syncs')
        .query({ connectionId: sync.connectionId })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .send()

      expect(body).toMatchObject({
        syncs: [
          {
            clientId: sync.clientId,
            connectionId: sync.connectionId,
            createdAt: sync.createdAt.toISOString(),
            syncId: sync.syncId,
            status: sync.status
          }
        ]
      })

      expect(status).toEqual(HttpStatus.OK)

      expect(body.syncs.length).toEqual(1)
    })

    it('responds with limited number of syncs when limit is given', async () => {
      await syncService.start({ clientId })

      const { body } = await request(app.getHttpServer())
        .get('/syncs')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)

      expect(body.syncs.length).toEqual(1)
      expect(body.page).toHaveProperty('next')
    })

    it('responds the next page of results when cursos is given', async () => {
      await syncService.start({ clientId })

      const { body: pageOne } = await request(app.getHttpServer())
        .get('/syncs')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)

      const { body: pageTwo } = await request(app.getHttpServer())
        .get('/syncs')
        .query({
          limit: 1,
          cursor: pageOne.page.next
        })
        .set(REQUEST_HEADER_CLIENT_ID, clientId)

      expect(pageTwo.syncs.length).toEqual(1)
      expect(pageTwo.page).toHaveProperty('next')
    })
  })
})
