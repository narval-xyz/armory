import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { Provider } from '../../core/type/provider.type'
import { AssetSeed } from '../../persistence/seed/asset.seed'
import { NetworkSeed } from '../../persistence/seed/network.seed'
import { signedRequest } from '../../shared/__test__/request'
import { TEST_CLIENT_ID, testClient, testUserPrivateJwk } from '../util/mock-data'

import { VaultTest } from '../../../__test__/shared/vault.test'
import { PaginatedAssetsDto } from '../../http/rest/dto/response/paginated-assets.dto'
import '../../shared/__test__/matcher'

describe('Asset', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let networkSeed: NetworkSeed
  let assetSeed: AssetSeed

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    clientService = module.get(ClientService)
    networkSeed = module.get(NetworkSeed)
    assetSeed = module.get(AssetSeed)
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
  })

  describe('GET /assets', () => {
    it('returns the list of assets for the specified provider', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/assets')
        .query({ provider: Provider.ANCHORAGE })
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .send()

      expect(body).toMatchZodSchema(PaginatedAssetsDto.schema)
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns different assets for different providers', async () => {
      const anchorageResponse = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/assets')
        .query({ provider: Provider.ANCHORAGE })
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .send()

      const fireblocksResponse = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/assets')
        .query({ provider: Provider.FIREBLOCKS })
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .send()

      expect(anchorageResponse.status).toEqual(HttpStatus.OK)
      expect(fireblocksResponse.status).toEqual(HttpStatus.OK)

      expect(anchorageResponse.body.data).not.toEqual(fireblocksResponse.body.data)
    })
  })
})
