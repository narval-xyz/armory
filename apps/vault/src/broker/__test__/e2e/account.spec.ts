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
import { getExpectedAccount, getExpectedAddress } from '../util/map-db-to-returned'
import {
  TEST_ACCOUNTS,
  TEST_ADDRESSES,
  TEST_CLIENT_ID,
  getJwsd,
  testClient,
  testUserPrivateJwk
} from '../util/mock-data'

describe('Account', () => {
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

  describe('GET /accounts', () => {
    it('returns the list of accounts with addresses for the client', async () => {
      const response = await request(app.getHttpServer())
        .get('/provider/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/accounts',
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)

      expect(response.body).toEqual({
        accounts: TEST_ACCOUNTS.map(getExpectedAccount),
        page: {
          next: null
        }
      })
    })

    it('returns empty list for unknown client', async () => {
      const response = await request(app.getHttpServer())
        .get('/provider/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/accounts',
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /accounts with pagination', () => {
    it('returns limited number of accounts when limit parameter is provided', async () => {
      const limit = 1
      const response = await request(app.getHttpServer())
        .get(`/provider/accounts?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts?limit=${limit}`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)

      expect(response.body.accounts).toHaveLength(limit)
      expect(response.body.page).toHaveProperty('next')
    })

    it('returns next page of results using cursor', async () => {
      // First request
      const firstResponse = await request(app.getHttpServer())
        .get('/provider/accounts?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/accounts?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
      expect(firstResponse.status).toEqual(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      // Second request using the cursor
      const secondResponse = await request(app.getHttpServer())
        .get(`/provider/accounts?cursor=${cursor}&limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts?cursor=${cursor}&limit=1`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(secondResponse.status).toEqual(HttpStatus.OK)

      expect(secondResponse.body.accounts).toHaveLength(1)
      expect(secondResponse.body.accounts[0].accountId).not.toBe(firstResponse.body.accounts[0].accountId)
    })

    it('handles descending orderBy createdAt parameter correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/provider/accounts?orderBy=createdAt&desc=true`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/accounts?orderBy=createdAt&desc=true',
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)

      const returnedAccounts = response.body.accounts
      expect(returnedAccounts).toHaveLength(TEST_ACCOUNTS.length)
      expect(new Date(returnedAccounts[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(returnedAccounts[1].createdAt).getTime()
      )
    })
  })

  describe('GET /accounts/:accountId', () => {
    it('returns the account details with addresses', async () => {
      const account = TEST_ACCOUNTS[0]
      const response = await request(app.getHttpServer())
        .get(`/provider/accounts/${account.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts/${account.id}`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)
      expect(response.body).toEqual({
        account: getExpectedAccount(account)
      })
    })

    it('returns 404 with proper error message for non-existent account', async () => {
      const response = await request(app.getHttpServer())
        .get(`/provider/accounts/non-existent`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts/non-existent`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing account from unknown client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/provider/accounts/${TEST_ACCOUNTS[0].id}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts/${TEST_ACCOUNTS[0].id}`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /accounts/:accountId/addresses', () => {
    it('returns the list of addresses for the account', async () => {
      const account = TEST_ACCOUNTS[0]
      const addresses = TEST_ADDRESSES.filter((addr) => addr.accountId === account.id)

      const response = await request(app.getHttpServer())
        .get(`/provider/accounts/${account.id}/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts/${account.id}/addresses`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)

      expect(response.body).toEqual({
        addresses: addresses.map(getExpectedAddress),
        page: {
          next: null
        }
      })
    })

    it('returns empty addresses array for account with no addresses', async () => {
      // Create a new account without addresses
      const accountWithoutAddresses = {
        ...TEST_ACCOUNTS[0],
        externalId: 'test-external-id',
        id: 'test-account-without-addresses'
      }
      await testPrismaService.getClient().providerAccount.create({
        data: accountWithoutAddresses
      })

      const response = await request(app.getHttpServer())
        .get(`/provider/accounts/${accountWithoutAddresses.id}/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/accounts/${accountWithoutAddresses.id}/addresses`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(response.status).toEqual(HttpStatus.OK)
      expect(response.body).toEqual({
        addresses: [],
        page: {
          next: null
        }
      })
    })
  })
})
