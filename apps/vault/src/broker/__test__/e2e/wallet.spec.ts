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
import { getExpectedAccount, getExpectedWallet } from '../util/map-db-to-returned'
import { TEST_ACCOUNTS, TEST_CLIENT_ID, TEST_WALLETS } from '../util/mock-data'

describe('Wallet', () => {
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

  describe('GET /wallets', () => {
    it('returns the list of wallets with accounts for the client', async () => {
      const res = await request(app.getHttpServer()).get('/wallets').set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({
        wallets: TEST_WALLETS.map(getExpectedWallet),
        page: {}
      })
    })

    it("doesn't return private connection information", async () => {
      const res = await request(app.getHttpServer()).get('/wallets').set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.OK)

      for (const wallet of res.body.wallets) {
        for (const connection of wallet.connections) {
          expect(connection).not.toHaveProperty('credentials')
          expect(connection).not.toHaveProperty('revokedAt')
        }
      }
    })

    it('returns empty list for unknown client', async () => {
      const res = await request(app.getHttpServer()).get('/wallets').set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')

      expect(res.body).toEqual({ wallets: [], page: {} })
      expect(res.status).toBe(HttpStatus.OK)
    })
  })

  describe('GET /wallets with pagination', () => {
    it('returns limited number of wallets when limit parameter is provided', async () => {
      // We have 2 wallets in TEST_WALLETS
      const limit = 1
      const res = await request(app.getHttpServer())
        .get('/wallets?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.body.wallets).toHaveLength(limit)
      expect(res.body.page).toHaveProperty('next')
      expect(res.status).toBe(HttpStatus.OK)
    })

    it('returns next page of results using cursor', async () => {
      const firstResponse = await request(app.getHttpServer())
        .get(`/wallets?limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      expect(firstResponse.status).toBe(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      const secondResponse = await request(app.getHttpServer())
        .get(`/wallets?cursor=${cursor}`)

        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)
      expect(secondResponse.status).toBe(HttpStatus.OK)

      expect(secondResponse.body.wallets).toHaveLength(1)
      // The second wallet should not be the same as the first
      expect(secondResponse.body.wallets[0].walletId).not.toBe(firstResponse.body.wallets[0].walletId)
    })
    it('handles descending orderBy createdAt parameter correctly', async () => {
      const res = await request(app.getHttpServer())
        .get('/wallets?orderBy=createdAt&desc=true')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

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
        .get('/wallets?orderBy=invalid-field')
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
    })
  })

  describe('GET /wallets/:walletId', () => {
    it('returns the wallet details with accounts and addresses', async () => {
      const wallet = TEST_WALLETS[0]
      const res = await request(app.getHttpServer())
        .get(`/wallets/${wallet.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.OK)

      expect(res.body).toEqual({
        wallet: getExpectedWallet(wallet)
      })
    })

    it('returns 404 with proper error message for non-existent wallet', async () => {
      const res = await request(app.getHttpServer())
        .get(`/wallets/non-existent`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing wallet from wrong client', async () => {
      const wallet = TEST_WALLETS[0]
      const res = await request(app.getHttpServer())
        .get(`/wallets/${wallet.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'wrong-client')

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets/:walletId/accounts', () => {
    it('returns the list of accounts for the wallet', async () => {
      const wallet = TEST_WALLETS[0]
      const accounts = TEST_ACCOUNTS.filter((acc) => acc.walletId === wallet.id)
      const res = await request(app.getHttpServer())
        .get(`/wallets/${wallet.id}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({
        accounts: accounts.map(getExpectedAccount),
        page: {}
      })
    })

    it('returns empty accounts array for wallet with no accounts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/wallets/${TEST_WALLETS[1].id}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, TEST_CLIENT_ID)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body).toEqual({ accounts: [], page: {} })
    })
  })
})
