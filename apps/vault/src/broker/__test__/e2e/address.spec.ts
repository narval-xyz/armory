import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { map } from 'lodash'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { PaginatedAddressesDto } from '../../http/rest/dto/response/paginated-addresses.dto'
import { anchorageAddressOne, anchorageConnectionOne, seed, userPrivateKey } from '../../shared/__test__/fixture'
import { signedRequest } from '../../shared/__test__/request'
import { REQUEST_HEADER_CONNECTION_ID } from '../../shared/constant'

import '../../shared/__test__/matcher'

describe('Address', () => {
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

  describe('GET /addresses', () => {
    it('returns the list of addresses for the client', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get(`/provider/addresses`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toMatchZodSchema(PaginatedAddressesDto.schema)
      expect(body.data).toHaveLength(2)
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /addresses with pagination', () => {
    it('returns limited number of addresses when limit parameter is provided', async () => {
      const limit = 1
      const { body } = await signedRequest(app, userPrivateKey)
        .get('/provider/addresses')
        .query({ limit })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body.data).toHaveLength(limit)
      expect(body.page).toHaveProperty('next')
    })

    it('returns next page of results using cursor', async () => {
      const firstResponse = await signedRequest(app, userPrivateKey)
        .get('/provider/addresses')
        .query({ limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      const cursor = firstResponse.body.page?.next

      expect(cursor).toBeDefined()

      const secondResponse = await signedRequest(app, userPrivateKey)
        .get('/provider/addresses')
        .query({ cursor, limit: 1 })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(secondResponse.body.data).toHaveLength(1)
      expect(secondResponse.body.data[0].addressId).not.toBe(firstResponse.body.data[0].addressId)
    })

    it('handles descending orderBy createdAt parameter correctly', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get('/provider/addresses')
        .query({ orderBy: 'createdAt', desc: true })
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      const addresses = body.data

      expect(addresses).toHaveLength(2)
      expect(map(addresses, 'externalId')).toEqual(['address-external-id-two', 'address-external-id-one'])
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('GET /addresses/:addressId', () => {
    it('returns the address details', async () => {
      const { status, body } = await signedRequest(app, userPrivateKey)
        .get(`/provider/addresses/${anchorageAddressOne.addressId}`)
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(body).toEqual({
        data: {
          ...anchorageAddressOne,
          createdAt: anchorageAddressOne.createdAt.toISOString(),
          updatedAt: anchorageAddressOne.updatedAt.toISOString()
        }
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('returns 404 with proper error message for non-existent address', async () => {
      const { status } = await signedRequest(app, userPrivateKey)
        .get('/provider/addresses/non-existent')
        .set(REQUEST_HEADER_CLIENT_ID, anchorageConnectionOne.clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, anchorageConnectionOne.connectionId)
        .send()

      expect(status).toEqual(HttpStatus.NOT_FOUND)
    })
  })
})
