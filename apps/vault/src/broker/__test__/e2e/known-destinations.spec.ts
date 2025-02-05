import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../../core/provider/anchorage/__test__/server-mock/server'
import { ConnectionService } from '../../core/service/connection.service'
import { Provider } from '../../core/type/provider.type'
import { PaginatedKnownDestinationsDto } from '../../http/rest/dto/response/paginated-known-destinations.dto'
import { AssetSeed } from '../../persistence/seed/asset.seed'
import { NetworkSeed } from '../../persistence/seed/network.seed'
import { setupMockServer } from '../../shared/__test__/mock-server'
import { REQUEST_HEADER_CONNECTION_ID } from '../../shared/constant'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

import { VaultTest } from '../../../__test__/shared/vault.test'
import '../../shared/__test__/matcher'

describe('Known Destination', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let connectionService: ConnectionService
  let assetSeed: AssetSeed
  let networkSeed: NetworkSeed

  let connectionId: string

  setupMockServer(getHandlers())

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    assetSeed = module.get(AssetSeed)
    clientService = module.get(ClientService)
    connectionService = module.get(ConnectionService)
    networkSeed = module.get(NetworkSeed)
    provisionService = module.get(ProvisionService)
    testPrismaService = module.get(TestPrismaService)

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
    await networkSeed.seed()
    await assetSeed.seed()

    await app.init()

    const connection = await connectionService.create(testClient.clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE,
      url: ANCHORAGE_TEST_API_BASE_URL,
      createdAt: new Date(),
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })

    connectionId = connection.connectionId
  })

  describe('GET /provider/known-destinations', () => {
    it('returns known destinations for a connection', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(body).toMatchZodSchema(PaginatedKnownDestinationsDto.schema)
      expect(status).toBe(HttpStatus.OK)
    })

    it('returns 400 when connection id header is missing', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/provider/known-destinations')
        .set(REQUEST_HEADER_CLIENT_ID, testClient.clientId)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/known-destinations`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(status).toBe(HttpStatus.BAD_REQUEST)
    })
  })
})
