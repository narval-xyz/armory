import { ConfigModule } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { load } from '../../../main.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { BrokerModule } from '../../broker.module'
import { getExpectedAddress } from '../util/map-db-to-returned'
import { TEST_ADDRESSES, TEST_CLIENT_ID } from '../util/mock-data'

describe('Address', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

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
    })
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()
    testPrismaService = module.get(TestPrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
    await testPrismaService.seedBrokerTestData()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('GET /addresses', () => {
    it('returns the list of addresses for the client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      expect(response.status).toEqual(HttpStatus.OK)

      expect(response.body).toEqual({
        addresses: TEST_ADDRESSES.map(getExpectedAddress),
        page: {}
      })
    })
  })

  describe('GET /addresses with pagination', () => {
    it('returns limited number of addresses when limit parameter is provided', async () => {
      const limit = 1
      const response = await request(app.getHttpServer())
        .get(`/addresses?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(response.body.addresses).toHaveLength(limit)
      expect(response.body.page).toHaveProperty('next')
    })

    it('returns next page of results using cursor', async () => {
      // First request
      const firstResponse = await request(app.getHttpServer())
        .get('/addresses?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .expect(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      // Second request using the cursor
      const secondResponse = await request(app.getHttpServer())
        .get(`/addresses?cursor=${cursor}&limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .expect(HttpStatus.OK)

      expect(secondResponse.body.addresses).toHaveLength(1)
      expect(secondResponse.body.addresses[0].addressId).not.toBe(firstResponse.body.addresses[0].addressId)
    })

    it('handles descending orderBy createdAt parameter correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/addresses?orderBy=createdAt&desc=true')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .expect(HttpStatus.OK)

      const returnedAddresses = response.body.addresses
      expect(returnedAddresses).toHaveLength(TEST_ADDRESSES.length)
      expect(new Date(returnedAddresses[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(returnedAddresses[1].createdAt).getTime()
      )
    })
  })

  describe('GET /addresses/:addressId', () => {
    it('returns the address details', async () => {
      const address = TEST_ADDRESSES[0]
      const response = await request(app.getHttpServer())
        .get(`/addresses/${address.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(response.body).toEqual({
        address: getExpectedAddress(address)
      })
      expect(response.status).toBe(HttpStatus.OK)
    })

    it('returns 404 with proper error message for non-existent address', async () => {
      const response = await request(app.getHttpServer())
        .get('/addresses/non-existent')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(response.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing address from different client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/addresses/${TEST_ADDRESSES[0].id}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'different-client')

      expect(response.status).toBe(HttpStatus.NOT_FOUND)
    })
  })
})
