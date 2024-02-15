import { AccountClassification, Action, OrganizationEntity, Signature } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../orchestration.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../orchestration.constant'
import { PolicyEngineModule } from '../../../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'

const API_RESOURCE_USER_ENTITY = '/store/address-book'

describe('Address Book Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let orgRepository: OrganizationRepository
  let addressBookRepository: AddressBookRepository

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        QueueModule.forRoot(),
        PolicyEngineModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository)
    addressBookRepository = module.get<AddressBookRepository>(AddressBookRepository)

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await orgRepository.create(organization.uid)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`POST ${API_RESOURCE_USER_ENTITY}`, () => {
    it('registers a new account in the address book', async () => {
      const account = {
        uid: '089c131e-9507-412a-8b4a-45e6a8213d77',
        address: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
        chainId: 1,
        classification: AccountClassification.INTERNAL
      }

      const payload = {
        authentication,
        approvals,
        request: {
          nonce,
          action: Action.CREATE_ADDRESS_BOOK_ACCOUNT,
          account
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)
        .send(payload)

      const actualAccount = await addressBookRepository.findById(account.uid)

      expect(body).toEqual({ account })
      expect(actualAccount).toEqual(account)
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
