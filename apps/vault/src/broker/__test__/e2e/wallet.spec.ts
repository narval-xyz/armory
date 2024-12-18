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
import { Wallet } from '../../core/type/indexed-resources.type'
import { getExpectedAccount, getExpectedWallet } from '../util/map-db-to-returned'
import {
  TEST_ACCOUNTS,
  TEST_CLIENT_ID,
  TEST_DIFFERENT_CLIENT_ID,
  TEST_WALLETS,
  getJwsd,
  testClient,
  testDifferentClient,
  testUserPrivateJwk
} from '../util/mock-data'

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

    await clientService.save(testDifferentClient)
    await clientService.save(testClient)
    await testPrismaService.seedBrokerTestData()

    await app.init()
  })

  describe('GET /wallets', () => {
    it('returns the list of wallets with accounts for the client', async () => {
      const { status, body } = await request(app.getHttpServer())
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

      expect(body).toEqual({
        data: TEST_WALLETS.filter((w) => w.clientId === TEST_CLIENT_ID)
          .map(getExpectedWallet)
          .reverse(),
        page: {
          next: null
        }
      })

      expect(status).toBe(HttpStatus.OK)
    })

    it('does not return private connection information', async () => {
      const { status, body } = await request(app.getHttpServer())
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

      for (const wallet of body.data) {
        for (const connection of wallet.connections) {
          expect(connection).not.toHaveProperty('credentials')
          expect(connection).not.toHaveProperty('revokedAt')
        }
      }

      expect(status).toBe(HttpStatus.OK)
    })

    it('returns 404 auth error for unknown client', async () => {
      const { status, body } = await request(app.getHttpServer())
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

      expect(body).toEqual({
        message: 'Client not found',
        statusCode: HttpStatus.NOT_FOUND,
        stack: expect.any(String)
      })

      expect(status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets with pagination', () => {
    it('returns limited number of wallets when limit parameter is provided', async () => {
      const limit = 2
      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/wallets?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets?limit=${limit}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(body.data).toHaveLength(limit)
      expect(body.page.next).toBeDefined()
      // First two wallets should be returned in createdAt descending order
      expect(body.data.map((w: Wallet) => w.walletId)).toEqual(['wallet-5', 'wallet-4'])

      expect(status).toBe(HttpStatus.OK)
    })

    it('returns all wallets when limit exceeds total count', async () => {
      const limit = 10
      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/wallets?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets?limit=${limit}`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(body.data).toHaveLength(5) // Total wallets for TEST_CLIENT_ID
      expect(body.page.next).toBeNull() // No next page

      expect(status).toBe(HttpStatus.OK)
    })

    it('navigates through all pages using cursor', async () => {
      const limit = 2
      const allWallets = []
      let cursor = null

      do {
        const url: string = cursor
          ? `/provider/wallets?limit=${limit}&cursor=${cursor}`
          : `/provider/wallets?limit=${limit}`

        const { status, body } = await request(app.getHttpServer())
          .get(url)
          .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk: testUserPrivateJwk,
              requestUrl: url,
              payload: {},
              htm: 'GET'
            })
          )

        expect(status).toBe(HttpStatus.OK)
        allWallets.push(...body.data)
        cursor = body.page.next
      } while (cursor)

      expect(allWallets).toHaveLength(5) // Total wallets for TEST_CLIENT_ID
      // Check if wallets are unique
      const uniqueWalletIds = new Set(allWallets.map((w) => w.walletId))
      expect(uniqueWalletIds.size).toBe(5)
    })

    it('handles descending order by createdAt parameter correctly', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/wallets?sortOrder=desc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?sortOrder=desc',
            payload: {},
            htm: 'GET'
          })
        )

      expect(body.data.map((w: Wallet) => w.walletId)).toEqual([
        'wallet-5',
        'wallet-4',
        'wallet-3',
        'wallet-2',
        'wallet-1'
      ])

      expect(status).toBe(HttpStatus.OK)
    })

    it('handles ascending order by createdAt parameter correctly', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/wallets?sortOrder=asc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?sortOrder=asc',
            payload: {},
            htm: 'GET'
          })
        )

      const wallets = body.data
      // Should return wallets in normal order
      expect(wallets.map((w: Wallet) => w.walletId)).toEqual([
        'wallet-1',
        'wallet-2',
        'wallet-3',
        'wallet-4',
        'wallet-5'
      ])

      expect(status).toBe(HttpStatus.OK)
    })

    it('handles asc order when createdAt is same for multiple wallets', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/wallets?sortOrder=asc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_DIFFERENT_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?sortOrder=asc',
            payload: {},
            htm: 'GET'
          })
        )

      const wallets = body.data

      const walletIds = wallets.map((w: Wallet) => w.walletId)

      // Should return wallets in normal order
      expect(walletIds).toEqual(['wallet-6', 'wallet-7', 'wallet-8'])

      expect(status).toBe(HttpStatus.OK)
    })

    it('handles desc order when createdAt is same for multiple wallets', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/provider/wallets?sortOrder=desc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_DIFFERENT_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?sortOrder=desc',
            payload: {},
            htm: 'GET'
          })
        )

      const wallets = body.data
      const walletIds = wallets.map((w: Wallet) => w.walletId)

      // Should return wallets in normal order
      expect(walletIds).toEqual(['wallet-8', 'wallet-7', 'wallet-6'])

      expect(status).toBe(HttpStatus.OK)
    })

    describe('GET /wallets pagination with different directions and sort orders', () => {
      let cursor: string

      beforeEach(async () => {
        // Get initial cursor from latest wallet
        const { status, body } = await request(app.getHttpServer())
          .get('/provider/wallets?limit=1&sortOrder=desc')
          .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk: testUserPrivateJwk,
              requestUrl: '/provider/wallets?limit=1&sortOrder=desc',
              payload: {},
              htm: 'GET'
            })
          )

        expect(status).toBe(HttpStatus.OK)

        cursor = body.page.next
      })

      it('returns no results when paginating prev in desc order from newest record', async () => {
        const { status, body } = await request(app.getHttpServer())
          .get(`/provider/wallets?cursor=${cursor}&direction=prev&limit=2&sortOrder=desc`)
          .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk: testUserPrivateJwk,
              requestUrl: `/provider/wallets?cursor=${cursor}&direction=prev&limit=2&sortOrder=desc`,
              payload: {},
              htm: 'GET'
            })
          )

        expect(body.data).toEqual([])

        expect(status).toBe(HttpStatus.OK)
      })

      it('returns next older records when paginating next in desc order', async () => {
        const { status, body } = await request(app.getHttpServer())
          .get(`/provider/wallets?cursor=${cursor}&direction=next&limit=2&sortOrder=desc`)
          .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk: testUserPrivateJwk,
              requestUrl: `/provider/wallets?cursor=${cursor}&direction=next&limit=2&sortOrder=desc`,
              payload: {},
              htm: 'GET'
            })
          )

        expect(body.data).toHaveLength(2)
        expect(body.data.map((w: Wallet) => w.walletId)).toEqual(['wallet-4', 'wallet-3'])

        expect(status).toBe(HttpStatus.OK)
      })

      it('returns next newer records when paginating prev in asc order', async () => {
        const { status, body } = await request(app.getHttpServer())
          .get(`/provider/wallets?cursor=${cursor}&direction=prev&limit=2&sortOrder=asc`)
          .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
          .set(
            'detached-jws',
            await getJwsd({
              userPrivateJwk: testUserPrivateJwk,
              requestUrl: `/provider/wallets?cursor=${cursor}&direction=prev&limit=2&sortOrder=asc`,
              payload: {},
              htm: 'GET'
            })
          )

        expect(body.data).toHaveLength(2)
        expect(body.data.map((w: Wallet) => w.walletId)).toEqual(['wallet-3', 'wallet-4'])

        expect(status).toBe(HttpStatus.OK)
      })
    })

    it('returns empty array when cursor points to first wallet and direction is prev', async () => {
      // First get the earliest wallet
      const firstRequest = await request(app.getHttpServer())
        .get('/provider/wallets?limit=1&sortOrder=asc')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: '/provider/wallets?limit=1&sortOrder=asc',
            payload: {},
            htm: 'GET'
          })
        )

      const cursor = firstRequest.body.page.next

      const { status, body } = await request(app.getHttpServer())
        .get(`/provider/wallets?cursor=${cursor}&sortOrder=asc&direction=prev`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
        .set(
          'detached-jws',
          await getJwsd({
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `/provider/wallets?cursor=${cursor}&sortOrder=asc&direction=prev`,
            payload: {},
            htm: 'GET'
          })
        )

      expect(body.data).toHaveLength(0)
      expect(body.page.next).toBeNull()

      expect(status).toBe(HttpStatus.OK)
    })
  })

  describe('GET /wallets/:walletId', () => {
    it('returns the wallet details with accounts and addresses', async () => {
      const wallet = TEST_WALLETS[0]
      const { status, body } = await request(app.getHttpServer())
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

      expect(body).toEqual({
        data: getExpectedWallet(wallet)
      })

      expect(status).toBe(HttpStatus.OK)
    })

    it('returns 404 with proper error message for non-existent wallet', async () => {
      const { status } = await request(app.getHttpServer())
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

      expect(status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing wallet from wrong client', async () => {
      const wallet = TEST_WALLETS[0]
      const { status } = await request(app.getHttpServer())
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

      expect(status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets/:walletId/accounts', () => {
    it('returns the list of accounts for the wallet', async () => {
      const wallet = TEST_WALLETS[0]
      const accounts = TEST_ACCOUNTS.filter((acc) => acc.walletId === wallet.id)
      const { status, body } = await request(app.getHttpServer())
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

      expect(body).toEqual({
        data: accounts.map(getExpectedAccount).reverse(),
        page: {
          next: null
        }
      })

      expect(status).toBe(HttpStatus.OK)
    })

    it('returns empty accounts array for wallet with no accounts', async () => {
      const { status, body } = await request(app.getHttpServer())
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

      expect(body).toEqual({
        data: [],
        page: {
          next: null
        }
      })

      expect(status).toBe(HttpStatus.OK)
    })
  })
})
