import { AccountType, Action, OrganizationEntity, Signature } from '@narval/policy-engine-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { generateSignature } from '../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../armory.config'
import { REQUEST_HEADER_ORG_ID } from '../../../../armory.constant'
import { OrchestrationModule } from '../../../../orchestration/orchestration.module'
import { PersistenceModule } from '../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../shared/module/queue/queue.module'
import { EntityStoreModule } from '../../entity-store.module'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

const API_RESOURCE_USER_ENTITY = '/store/wallets'

describe('Wallet Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let orgRepository: OrganizationRepository
  let walletRepository: WalletRepository

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        QueueModule.forRoot(),
        OrchestrationModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository)
    walletRepository = module.get<WalletRepository>(WalletRepository)

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
    it('creates a new wallet entity', async () => {
      const wallet = {
        uid: 'a5c1fd4e-b021-4fad-b5a6-256b434916ef',
        address: '0x648edbd0e1bd5f15d58481bc7f034a790f9741fe',
        accountType: AccountType.EOA,
        chainId: 1
      }

      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.REGISTER_WALLET,
          nonce,
          wallet
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)
        .send(payload)

      const actualWallet = await walletRepository.findById(wallet.uid)

      expect(body).toEqual({ wallet })
      expect(status).toEqual(HttpStatus.CREATED)
      expect(actualWallet).toEqual(wallet)
    })
  })
})
