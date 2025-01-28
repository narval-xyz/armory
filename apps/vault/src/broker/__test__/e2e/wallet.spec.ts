import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { VaultTest } from '../../../__test__/shared/vault.test'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { Account, Wallet } from '../../core/type/indexed-resources.type'
import { PaginatedWalletsDto } from '../../http/rest/dto/response/paginated-wallets.dto'
import { ProviderWalletDto } from '../../http/rest/dto/response/provider-wallet.dto'
import { anchorageConnectionOne, anchorageWalletOne, anchorageWalletThree, seed } from '../../shared/__test__/fixture'
import { signedRequest } from '../../shared/__test__/request'
import { REQUEST_HEADER_CONNECTION_ID } from '../../shared/constant'
import { TEST_WALLETS, testUserPrivateJwk } from '../util/mock-data'

import '../../shared/__test__/matcher'

describe('Wallet', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()
    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)

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

    await seed(module)

    await app.init()
  })

  describe('GET /wallets', () => {
    it('returns the list of wallets with accounts', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(PaginatedWalletsDto.schema)
      expect(body.data).toHaveLength(3)
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns 404 auth error for unknown client', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')
        .set(REQUEST_HEADER_CONNECTION_ID, 'unknown-connection-id')
        .send()

      expect(body).toEqual({
        message: 'Client not found',
        statusCode: HttpStatus.NOT_FOUND,
        stack: expect.any(String)
      })

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets with pagination', () => {
    it('returns limited number of wallets when limit parameter is provided', async () => {
      const limit = 2
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({ limit })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data).toHaveLength(limit)
      expect(body.page.next).toBeDefined()
      // First two wallets should be returned in createdAt descending order
      expect(body.data.map((w: Wallet) => w.label)).toEqual(['wallet 3', 'wallet 2'])
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns all wallets when limit exceeds total count', async () => {
      const limit = 10
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({ limit })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data).toHaveLength(3)
      expect(body.page.next).toBeNull()
      expect(status).toEqual(HttpStatus.OK)
    })

    it('navigates through all pages using cursor', async () => {
      const limit = 2
      const wallets = []
      let cursor = undefined

      do {
        const { status, body } = await signedRequest(app, testUserPrivateJwk)
          .get('/provider/wallets')
          .query({ cursor, limit })
          .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
          .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
          .send()

        expect(status).toBe(HttpStatus.OK)
        wallets.push(...body.data)
        cursor = body.page.next
      } while (cursor)

      expect(wallets).toHaveLength(3)
      expect(wallets.map((w: Wallet) => w.label)).toEqual(['wallet 3', 'wallet 2', 'wallet 1'])
    })

    it('handles descending order by createdAt parameter correctly', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({ sortOrder: 'desc' })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data.map((w: Wallet) => w.label)).toEqual(['wallet 3', 'wallet 2', 'wallet 1'])
      expect(status).toEqual(HttpStatus.OK)
    })

    it('handles ascending order by createdAt parameter correctly', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({ sortOrder: 'asc' })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data.map((w: Wallet) => w.label)).toEqual(['wallet 1', 'wallet 2', 'wallet 3'])
      expect(status).toEqual(HttpStatus.OK)
    })

    describe('GET /wallets pagination with different directions and sort orders', () => {
      let cursor: string

      beforeEach(async () => {
        // Get initial cursor from latest wallet
        const { status, body } = await signedRequest(app, testUserPrivateJwk)
          .get('/provider/wallets')
          .query({ limit: 1, sortOrder: 'desc' })
          .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
          .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
          .send()

        expect(status).toBe(HttpStatus.OK)

        cursor = body.page.next
      })

      it('returns no results when paginating prev in desc order from newest record', async () => {
        const { status, body } = await signedRequest(app, testUserPrivateJwk)
          .get('/provider/wallets')
          .query({
            cursor,
            direction: 'prev',
            limit: 2,
            sortOrder: 'desc'
          })
          .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
          .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
          .send()

        expect(body.data).toEqual([])
        expect(status).toEqual(HttpStatus.OK)
      })

      it('returns next older records when paginating next in desc order', async () => {
        const { status, body } = await signedRequest(app, testUserPrivateJwk)
          .get('/provider/wallets')
          .query({
            cursor,
            direction: 'next',
            limit: 2,
            sortOrder: 'desc'
          })
          .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
          .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
          .send()

        expect(body.data.map((w: Wallet) => w.label)).toEqual(['wallet 2', 'wallet 1'])
        expect(status).toEqual(HttpStatus.OK)
      })

      it('returns next newer records when paginating prev in asc order', async () => {
        const { status, body } = await signedRequest(app, testUserPrivateJwk)
          .get('/provider/wallets')
          .query({
            cursor,
            direction: 'prev',
            limit: 2,
            sortOrder: 'asc'
          })
          .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
          .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
          .send()

        expect(body.data).toHaveLength(2)
        expect(body.data.map((w: Wallet) => w.label)).toEqual(['wallet 1', 'wallet 2'])
        expect(status).toEqual(HttpStatus.OK)
      })
    })

    it('returns empty array when cursor points to first wallet and direction is prev', async () => {
      // First get the earliest wallet
      const firstRequest = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({
          limit: 1,
          sortOrder: 'asc'
        })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      const cursor = firstRequest.body.page.next

      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get('/provider/wallets')
        .query({
          cursor,
          sortOrder: 'asc',
          direction: 'prev'
        })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data).toHaveLength(0)
      expect(body.page.next).toBeNull()
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /wallets/:walletId', () => {
    it('returns the wallet details with accounts and addresses', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get(`/provider/wallets/${anchorageWalletOne.walletId}`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(ProviderWalletDto.schema)
      expect(body.data.walletId).toEqual(anchorageWalletOne.walletId)
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns 404 with proper error message for non-existent wallet', async () => {
      const { status } = await signedRequest(app, testUserPrivateJwk)
        .get(`/provider/wallets/non-existent`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when accessing wallet from wrong client', async () => {
      const wallet = TEST_WALLETS[0]
      const { status } = await signedRequest(app, testUserPrivateJwk)
        .get(`/provider/wallets/${wallet.id}`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /wallets/:walletId/accounts', () => {
    it('returns the list of accounts for the wallet', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get(`/provider/wallets/${anchorageWalletOne.walletId}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data.map((a: Account) => a.label)).toEqual(['wallet 1 account 2', 'wallet 1 account 1'])

      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns empty accounts array for wallet with no accounts', async () => {
      const { status, body } = await signedRequest(app, testUserPrivateJwk)
        .get(`/provider/wallets/${anchorageWalletThree.walletId}/accounts`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

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
