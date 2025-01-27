import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { PaginatedAccountsDto } from '../../http/rest/dto/response/paginated-accounts.dto'
import { PaginatedAddressesDto } from '../../http/rest/dto/response/paginated-addresses.dto'
import { ProviderAccountDto } from '../../http/rest/dto/response/provider-account.dto'
import { anchorageAccountOne, anchorageConnectionOne, seed, userPrivateKey } from '../../shared/__test__/fixture'
import { signedRequest } from '../../shared/__test__/request'
import { REQUEST_HEADER_CONNECTION_ID } from '../../shared/constant'
import { TEST_ACCOUNTS } from '../util/mock-data'

import '../../shared/__test__/matcher'

describe('Account', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService

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
    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
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

  describe('GET /accounts', () => {
    it('returns the list of accounts with addresses for the client', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get('/provider/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(PaginatedAccountsDto.schema)
      expect(body.data).toHaveLength(2)
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns 404 for unknown client', async () => {
      const { status } = await signedRequest(app, userPrivateKey)
        .get('/provider/accounts')
        .set(REQUEST_HEADER_CLIENT_ID, 'unknown-client')
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /accounts with pagination', () => {
    it('returns limited number of accounts when limit parameter is provided', async () => {
      const limit = 1
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts?limit=${limit}`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data).toHaveLength(limit)
      expect(body.page).toHaveProperty('next')

      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns next page of results using cursor', async () => {
      // First request
      const firstResponse = await signedRequest(app, userPrivateKey)
        .get('/provider/accounts?limit=1')
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(firstResponse.status).toEqual(HttpStatus.OK)

      const cursor = firstResponse.body.page?.next
      expect(cursor).toBeDefined()

      // Second request using the cursor
      const secondResponse = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts?cursor=${cursor}&limit=1`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(secondResponse.body.data).toHaveLength(1)
      expect(secondResponse.body.data[0].accountId).not.toBe(firstResponse.body.data[0].accountId)

      expect(secondResponse.status).toEqual(HttpStatus.OK)
    })

    it('handles ascending createdAt parameter correctly', async () => {
      const response = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts?sortOrder=asc`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(response.status).toEqual(HttpStatus.OK)

      const returnedAccounts = response.body.data
      expect(returnedAccounts).toHaveLength(TEST_ACCOUNTS.length)
      expect(new Date(returnedAccounts[1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(returnedAccounts[0].createdAt).getTime()
      )
    })
  })

  describe('GET /accounts/:accountId', () => {
    it('returns the account details with addresses', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts/${anchorageAccountOne.accountId}`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(ProviderAccountDto.schema)
      expect(body.data.accountId).toEqual(anchorageAccountOne.accountId)
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns 404 when account does not exist', async () => {
      const { status } = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts/does-not-exist`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })

    it('returns 404 when client does not exist', async () => {
      const { status } = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts/${anchorageAccountOne.accountId}`)
        .set(REQUEST_HEADER_CLIENT_ID, 'does-not-exist')
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /accounts/:accountId/addresses', () => {
    it('returns the list of addresses for the account', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get(`/provider/accounts/${anchorageAccountOne.accountId}/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(PaginatedAddressesDto.schema)
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
