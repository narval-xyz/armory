import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import request from 'supertest'
import { v4 } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { ANCHORAGE_TEST_API_BASE_URL } from '../../core/provider/anchorage/__test__/server-mock/server'
import { ConnectionService } from '../../core/service/connection.service'
import { KnownDestinationService } from '../../core/service/known-destination.service'
import { Provider } from '../../core/type/connection.type'
import { KnownDestination } from '../../core/type/indexed-resources.type'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('KnownDestination', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let knownDestinationService: KnownDestinationService
  let connectionService: ConnectionService

  let connection1Id: string
  let connection2Id: string

  const now = new Date('2025-01-01T00:00:00Z')

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
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()
    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)
    connectionService = module.get<ConnectionService>(ConnectionService)

    knownDestinationService = module.get<KnownDestinationService>(KnownDestinationService)
    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  let knownDestinations: KnownDestination[]

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await provisionService.provision()

    await clientService.save(testClient)

    await app.init()

    const connection1 = await connectionService.create(testClient.clientId, {
      connectionId: v4(),
      provider: Provider.ANCHORAGE,
      url: ANCHORAGE_TEST_API_BASE_URL,
      createdAt: now,
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    const connection2 = await connectionService.create(testClient.clientId, {
      connectionId: v4(),
      provider: Provider.ANCHORAGE,
      url: ANCHORAGE_TEST_API_BASE_URL,
      createdAt: now,
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    connection1Id = connection1.connectionId
    connection2Id = connection2.connectionId

    knownDestinations = [
      {
        clientId: 'test-client-id',
        provider: 'anchorage',
        externalId: 'neverChanges',
        externalClassification: null,
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        label: null,
        assetId: 'BTC',
        networkId: 'BTC',
        createdAt: now,
        updatedAt: now,
        connections: [connection1],
        knownDestinationId: 'c2f7d2f1-e0b5-4966-a55f-7257420df81f'
      },
      {
        clientId: 'test-client-id',
        provider: 'anchorage',
        externalId: 'toBeDeleted',
        externalClassification: null,
        address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        label: '123456',
        assetId: 'XRP',
        networkId: 'XRP',
        createdAt: now,
        updatedAt: now,
        connections: [connection1],
        knownDestinationId: '9ba64a60-0684-4b7c-9d2d-78bf0a1c6de8'
      },
      {
        clientId: 'test-client-id',
        provider: 'anchorage',
        externalId: 'toBeUpdated',
        externalClassification: null,
        address: '0x8Bc2B8F33e5AeF847B8973Fa669B948A3028D6bd',
        label: null,
        assetId: 'USDC',
        networkId: 'ETH',
        createdAt: now,
        updatedAt: now,
        connections: [connection2],
        knownDestinationId: '8d5e8d6f-2836-4d47-821d-80906e1a1448'
      },
      {
        clientId: 'test-client-id',
        provider: 'anchorage',
        externalId: 'toBeConnected',
        externalClassification: null,
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        label: null,
        assetId: 'ETH',
        networkId: 'ETH',
        createdAt: now,
        updatedAt: now,
        connections: [connection2],
        knownDestinationId: '04817a66-039d-43e7-ab0a-023997597054'
      }
    ]
    await knownDestinationService.bulkCreate(knownDestinations)
  })

  describe('GET /provider/known-destinations', () => {
    it('returns known destinations for a connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .query({ connectionId: connection1Id })
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations?connectionId=${connection1Id}`,
            payload: {},
            htm: 'GET'
          })
        )

      const expectedDestinations = [knownDestinations[0], knownDestinations[1]]

      expect(body).toEqual({
        data: expectedDestinations.map((knownDestination) => ({
          ...knownDestination,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          connections: knownDestination.connections.map((connection) => ({
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
            status: connection.status,
            provider: connection.provider,
            url: connection.url,
            connectionId: connection.connectionId,
            clientId: connection.clientId
          }))
        })),
        page: { next: null }
      })
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns known destinations for another connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .query({ connectionId: connection2Id })
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations?connectionId=${connection2Id}`,
            payload: {},
            htm: 'GET'
          })
        )

      const expectedDestinations = [knownDestinations[2], knownDestinations[3]]
      expect(body).toEqual({
        data: expectedDestinations.map((knownDestination) => ({
          ...knownDestination,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          connections: knownDestination.connections.map((connection) => ({
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
            status: connection.status,
            provider: connection.provider,
            url: connection.url,
            connectionId: connection.connectionId,
            clientId: connection.clientId
          }))
        })),
        page: { next: null }
      })
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns empty if connection is not in the system', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .query({ connectionId: 'unknown' })
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/known-destinations?connectionId=unknown',
            payload: {},
            htm: 'GET'
          })
        )

      expect(body).toEqual({ data: [], page: { next: null } })
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns all known destinations if connection is not specified', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/known-destinations',
            payload: {},
            htm: 'GET'
          })
        )

      expect(body).toEqual({
        data: knownDestinations.map((knownDestination) => ({
          ...knownDestination,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          connections: knownDestination.connections.map((connection) => ({
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
            status: connection.status,
            provider: connection.provider,
            url: connection.url,
            connectionId: connection.connectionId,
            clientId: connection.clientId
          }))
        })),
        page: { next: null }
      })
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns known destinations for a connection with pagination', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .query({ connectionId: connection1Id, limit: 1 })
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations?connectionId=${connection1Id}&limit=1`,
            payload: {},
            htm: 'GET'
          })
        )

      const expectedDestinations = [knownDestinations[0]]
      expect(body).toEqual({
        data: expectedDestinations.map((knownDestination) => ({
          ...knownDestination,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          connections: knownDestination.connections.map((connection) => ({
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
            status: connection.status,
            provider: connection.provider,
            url: connection.url,
            connectionId: connection.connectionId,
            clientId: connection.clientId
          }))
        })),
        page: { next: 'MjAyNS0wMS0wMVQwMDowMDowMC4wMDBafGMyZjdkMmYxLWUwYjUtNDk2Ni1hNTVmLTcyNTc0MjBkZjgxZg==' }
      })
      expect(status).toBe(HttpStatus.OK)
    })
  })

  describe('GET /provider/known-destinations/:knownDestinationId', () => {
    it('returns known destination', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations/c2f7d2f1-e0b5-4966-a55f-7257420df81f')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations/c2f7d2f1-e0b5-4966-a55f-7257420df81f`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(body.data).toEqual({
        ...knownDestinations[0],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        connections: knownDestinations[0].connections.map((connection) => ({
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
          status: connection.status,
          provider: connection.provider,
          url: connection.url,
          connectionId: connection.connectionId,
          clientId: connection.clientId
        }))
      })
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns 404 for unknown known destination', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations/unknown')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations/unknown`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(status).toBe(HttpStatus.NOT_FOUND)
    })
  })
})
