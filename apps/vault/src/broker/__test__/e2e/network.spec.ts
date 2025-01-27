import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { PaginatedNetworksDto } from '../../http/rest/dto/response/paginated-networks.dto'
import { NetworkSeed } from '../../persistence/seed/network.seed'
import { signedRequest } from '../../shared/__test__/request'
import { TEST_CLIENT_ID, testClient, testUserPrivateJwk } from '../util/mock-data'

import '../../shared/__test__/matcher'

describe('Network', () => {
  let app: INestApplication
  let module: TestingModule

  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let networkSeed: NetworkSeed

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
