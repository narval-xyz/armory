import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { PaginatedNetworksDto } from '../../http/rest/dto/response/paginated-networks.dto'
import { NetworkSeed } from '../../persistence/seed/network.seed'
import { signedRequest } from '../../shared/__test__/request'
import { TEST_CLIENT_ID, testClient, testUserPrivateJwk } from '../util/mock-data'

import { VaultTest } from '../../../__test__/shared/vault.test'
import '../../shared/__test__/matcher'

describe('Network', () => {
  let app: INestApplication
  let module: TestingModule

  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let networkSeed: NetworkSeed

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    clientService = module.get(ClientService)
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

    await app.init()
  })

  describe('GET /networks', () => {
    it('returns the list of networks', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/networks')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .send()

      expect(body).toMatchZodSchema(PaginatedNetworksDto.schema)
      expect(body.data).toHaveLength(networkSeed.getNetworks().length)
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
