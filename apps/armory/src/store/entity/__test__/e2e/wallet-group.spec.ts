import { AccountType, Action, OrganizationEntity, Signature, WalletEntity } from '@narval/authz-shared'
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
import { WalletGroupRepository } from '../../persistence/repository/wallet-group.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

const API_RESOURCE_USER_ENTITY = '/store/wallet-groups'

describe('Wallet Group Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let orgRepository: OrganizationRepository
  let walletGroupRepository: WalletGroupRepository
  let walletRepository: WalletRepository

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  const authentication: Signature = generateSignature()

  const approvals: Signature[] = [generateSignature(), generateSignature()]

  const nonce = 'b6d826b4-72cb-4c14-a6ca-235a2d8e9060'

  const wallet: WalletEntity = {
    uid: 'a5c1fd4e-b021-4fad-b5a6-256b434916ef',
    address: '0x648edbd0e1bd5f15d58481bc7f034a790f9741fe',
    accountType: AccountType.EOA,
    chainId: 1
  }

  const groupId = '2a1509ad-ea87-422e-bebd-974547cd4fee'

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
    walletGroupRepository = module.get<WalletGroupRepository>(WalletGroupRepository)

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
    await walletRepository.create(organization.uid, wallet)
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe(`POST ${API_RESOURCE_USER_ENTITY}`, () => {
    it('assigns a wallet to a group', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.ASSIGN_WALLET_GROUP,
          nonce,
          data: {
            groupId,
            walletId: wallet.uid
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)
        .send(payload)

      const actualGroup = await walletGroupRepository.findById(groupId)

      expect(body).toEqual({
        data: {
          groupId,
          walletId: wallet.uid
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)

      expect(actualGroup).toEqual({
        uid: groupId,
        wallets: [wallet.uid]
      })
    })
  })
})
