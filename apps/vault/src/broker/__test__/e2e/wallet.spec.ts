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
import { getExpectedAccount, getExpectedWallet } from '../util/map-db-to-returned'
import { TEST_ACCOUNTS, TEST_CLIENT_ID, TEST_WALLETS, getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

describe('Wallet', () => {
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

  describe('GET /wallets', () => {
    it('returns the list of wallets with accounts for the client', async () => {
      const res = await request(app.getHttpServer())
        .get('/provider/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets',
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({
        wallets: TEST_WALLETS.map(getExpectedWallet),
        page: {
          next: null
        }
      })
    })

    it("doesn't return private connection information", async () => {
      const res = await request(app.getHttpServer())
        .get('/provider/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets',
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.OK)

      for (const wallet of res.body.wallets) {
        for (const connection of wallet.connections) {
          expect(connection).not.toHaveProperty('credentials')
          expect(connection).not.toHaveProperty('revokedAt')
        }
      }
    })

    it('returns 404 auth error for unknown client', async () => {
      const res = await request(app.getHttpServer())
        .get('/provider/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets',
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
      expect(res.body).toEqual({
        message: 'Client not found',
        statusCode: HttpStatus.NOT_FOUND,
        stack: expect.any(String)
      })
    })
  })

  describe('GET /wallets with pagination', () => {
    it('returns limited number of wallets when limit parameter is provided', async () => {
      // We have 2 wallets in TEST_WALLETS
      const limit = 1
      const res = await request(app.getHttpServer())
        .get('/provider/wallets?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?limit=1',
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.body.wallets).toHaveLength(limit)
      expect(res.body.page).toHaveProperty('next')
      expect(res.status).toBe(HttpStatus.OK)
    })

    it('returns next page of results using cursor', async () => {
      const firstResponse = await request(app.getHttpServer())
        .get(`/provider/wallets?limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?limit=1',
            payload: {},
            htm: 'GET'
          })
        )
      expect(firstResponse.status).toBe(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      const secondResponse = await request(app.getHttpServer())
        .get(`/provider/wallets?cursor=${cursor}`)

        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets?cursor=${cursor}`,
            payload: {},
            htm: 'GET'
          })
        )
      expect(secondResponse.status).toBe(HttpStatus.OK)

      expect(secondResponse.body.wallets).toHaveLength(1)
      // The second wallet should not be the same as the first
      expect(secondResponse.body.wallets[0].walletId).not.toBe(firstResponse.body.wallets[0].walletId)
    })
    it('handles descending orderBy createdAt parameter correctly', async () => {
      const res = await request(app.getHttpServer())
        .get('/provider/wallets?orderBy=createdAt&desc=true')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?orderBy=createdAt&desc=true',
            payload: {},
            htm: 'GET'
          })
        )

      // Check descending order by createdAt
      const returnedWallets = res.body.wallets
      expect(returnedWallets).toHaveLength(TEST_WALLETS.length)
      expect(res.status).toBe(HttpStatus.OK)

      // When ordering by DESC, first item should have GREATER timestamp than second
      expect(new Date(returnedWallets[0].createdAt).getTime()).toBeGreaterThan(
        new Date(returnedWallets[1].createdAt).getTime()
      )
    })

    it('throws invalidField orderBy is not a valid field', async () => {
      const res = await request(app.getHttpServer())
        .get('/provider/wallets?orderBy=invalid-field')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?orderBy=invalid-field',
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
    })
  })

  describe('GET /wallets/:walletId', () => {
    it('returns the wallet details with accounts and addresses', async () => {
      const wallet = TEST_WALLETS[0]
      const res = await request(app.getHttpServer())
        .get(`/provider/wallets/${wallet.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets/${wallet.id}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.OK)

      expect(res.body).toEqual({
        wallet: getExpectedWallet(wallet)
      })
    })

    it('returns 404 with proper error message for non-existent wallet', async () => {
      const res = await request(app.getHttpServer())
        .get(`/provider/wallets/non-existent`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets/non-existent`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing wallet from wrong client', async () => {
      const wallet = TEST_WALLETS[0]
      const res = await request(app.getHttpServer())
        .get(`/provider/wallets/${wallet.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'wrong-client')
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets/${wallet.id}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets/:walletId/accounts', () => {
    it('returns the list of accounts for the wallet', async () => {
      const wallet = TEST_WALLETS[0]
      const accounts = TEST_ACCOUNTS.filter((acc) => acc.walletId === wallet.id)
      const res = await request(app.getHttpServer())
        .get(`/provider/wallets/${wallet.id}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets/${wallet.id}/accounts`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({
        accounts: accounts.map(getExpectedAccount),
        page: {
          next: null
        }
      })
    })

    it('returns empty accounts array for wallet with no accounts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/provider/wallets/${TEST_WALLETS[1].id}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets/${TEST_WALLETS[1].id}/accounts`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({
        accounts: [],
        page: {
          next: null
        }
      })
    })
  })
})
