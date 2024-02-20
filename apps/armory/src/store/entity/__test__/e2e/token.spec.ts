import { Action, OrganizationEntity, Signature, TokenEntity } from '@narval/authz-shared'
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
import { TokenRepository } from '../../persistence/repository/token.repository'

const API_RESOURCE_USER_ENTITY = '/store/tokens'

describe('Token Entity', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let orgRepository: OrganizationRepository
  let tokenRepository: TokenRepository

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
        OrchestrationModule,
        EntityStoreModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository)
    tokenRepository = module.get<TokenRepository>(TokenRepository)

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
    it('registers new tokens', async () => {
      const tokenOne: TokenEntity = {
        uid: '2ece731a-51be-4b4f-91de-5665eacf7006',
        address: '0x63d74e23f70f66511417bc7acf95f002d1dbd33c',
        chainId: 1,
        symbol: 'AAA',
        decimals: 18
      }

      const tokenTwo: TokenEntity = {
        uid: '50972056-fb28-4701-a2b6-b784a7d23e70',
        address: '0x33a184D851506C23d7B97f3d8d062483B9Cf495c',
        chainId: 1,
        symbol: 'BBB',
        decimals: 18
      }

      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.REGISTER_TOKENS,
          nonce,
          tokens: [tokenOne, tokenTwo]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post(API_RESOURCE_USER_ENTITY)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)
        .send(payload)

      const actualTokens = await tokenRepository.findByOrgId(organization.uid)

      expect(body).toEqual({ tokens: [tokenOne, tokenTwo] })
      expect(actualTokens).toEqual([tokenOne, tokenTwo])
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })
})
