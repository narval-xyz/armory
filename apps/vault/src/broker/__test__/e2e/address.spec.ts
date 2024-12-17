import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { getExpectedAddress } from '../util/map-db-to-returned'
import { TEST_ADDRESSES, TEST_CLIENT_ID, getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('Address', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

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
      .compile()

    app = module.createNestApplication()
    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)
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
    await testPrismaService.seedBrokerTestData()

    await app.init()
  })

  describe('GET /addresses', () => {
    it('returns the list of addresses for the client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/provider/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/addresses',
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)

      expect(response.body).toEqual({
        addresses: TEST_ADDRESSES.map(getExpectedAddress).reverse(),
        page: {
          next: null
        }
      })
    })
  })

  describe('GET /addresses with pagination', () => {
    it('returns limited number of addresses when limit parameter is provided', async () => {
      const limit = 1
      const response = await request(app.getHttpServer())
        .get(`/provider/addresses?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/addresses?limit=${limit}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(response.body.addresses).toHaveLength(limit)
      expect(response.body.page).toHaveProperty('next')
    })

    it('returns next page of results using cursor', async () => {
      // First request
      const firstResponse = await request(app.getHttpServer())
        .get('/provider/addresses?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/addresses?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
        .expect(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      // Second request using the cursor
      const secondResponse = await request(app.getHttpServer())
        .get(`/provider/addresses?cursor=${cursor}&limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/addresses?cursor=${cursor}&limit=1`,
            payload: {},
            htm: 'GET'
          })
        )
        .expect(HttpStatus.OK)

      expect(secondResponse.body.addresses).toHaveLength(1)
      expect(secondResponse.body.addresses[0].addressId).not.toBe(firstResponse.body.addresses[0].addressId)
    })

    it('handles ascending createdAt parameter correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/provider/addresses?sortOrder=asc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/addresses?sortOrder=asc',
            payload: {},
            htm: 'GET'
          })
        )
        .expect(HttpStatus.OK)

      const returnedAddresses = response.body.addresses
      expect(returnedAddresses).toHaveLength(TEST_ADDRESSES.length)
      expect(new Date(returnedAddresses[1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(returnedAddresses[0].createdAt).getTime()
      )
    })
  })

  describe('GET /addresses/:addressId', () => {
    it('returns the address details', async () => {
      const address = TEST_ADDRESSES[0]
      const response = await request(app.getHttpServer())
        .get(`/provider/addresses/${address.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/addresses/${address.id}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(response.body).toEqual({
        address: getExpectedAddress(address)
      })
      expect(response.status).toBe(HttpStatus.OK)
    })

    it('returns 404 with proper error message for non-existent address', async () => {
      const response = await request(app.getHttpServer())
        .get('/provider/addresses/non-existent')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/addresses/non-existent',
            payload: {},
            htm: 'GET'
          })
        )

      expect(response.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing address from different client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/provider/addresses/${TEST_ADDRESSES[0].id}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'different-client')
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/addresses/${TEST_ADDRESSES[0].id}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(response.status).toBe(HttpStatus.NOT_FOUND)
    })
  })
})
