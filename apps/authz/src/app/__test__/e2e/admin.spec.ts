import { Action, Alg, EntityType, FIXTURE, Signature, UserRole, ValueOperators } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { readFileSync, unlinkSync } from 'fs'
import { mock } from 'jest-mock-extended'
import request from 'supertest'
import { AppModule } from '../../../app/app.module'
import { Organization } from '../../../shared/types/entities.types'
import { Criterion, Then, TimeWindow } from '../../../shared/types/policy.type'
import { load } from '../../app.config'
import { EntityRepository } from '../../persistence/repository/entity.repository'

const REQUEST_HEADER_ORG_ID = 'x-org-id'
describe('Admin Endpoints', () => {
  let app: INestApplication
  let module: TestingModule

  // TODO: Real sigs; these will NOT match the test data.
  const authentication: Signature = {
    alg: Alg.ES256K,
    pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890',
    sig: '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c'
  }

  const approvals: Signature[] = [
    {
      alg: Alg.ES256K,
      pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06',
      sig: '0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b'
    },
    {
      alg: Alg.ES256K,
      pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e',
      sig: '0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c'
    }
  ]

  const org: Organization = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  beforeAll(async () => {
    const entityRepositoryMock = mock<EntityRepository>()
    entityRepositoryMock.fetch.mockResolvedValue(FIXTURE.ENTITIES)

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        AppModule
      ]
    })
      .overrideProvider(EntityRepository)
      .useValue(entityRepositoryMock)
      .compile()

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await module.close()
    await app.close()
  })

  describe('POST /policies', () => {
    it('sets the organization policies', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.SET_POLICY_RULES,
          nonce: 'random-nonce-111',
          data: [
            {
              then: Then.PERMIT,
              name: 'examplePermitPolicy',
              when: [
                {
                  criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
                  args: null
                },
                {
                  criterion: Criterion.CHECK_NONCE_EXISTS,
                  args: null
                },
                {
                  criterion: Criterion.CHECK_ACTION,
                  args: [Action.SIGN_TRANSACTION]
                },
                {
                  criterion: Criterion.CHECK_PRINCIPAL_ID,
                  args: ['matt@narval.xyz']
                },
                {
                  criterion: Criterion.CHECK_WALLET_ID,
                  args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
                },
                {
                  criterion: Criterion.CHECK_INTENT_TYPE,
                  args: [Intents.TRANSFER_NATIVE]
                },
                {
                  criterion: Criterion.CHECK_INTENT_TOKEN,
                  args: ['eip155:137/slip44:966']
                },
                {
                  criterion: Criterion.CHECK_INTENT_AMOUNT,
                  args: {
                    currency: '*',
                    operator: ValueOperators.LESS_THAN_OR_EQUAL,
                    value: '1000000000000000000'
                  }
                },
                {
                  criterion: Criterion.CHECK_APPROVALS,
                  args: [
                    {
                      approvalCount: 2,
                      countPrincipal: false,
                      approvalEntityType: EntityType.User,
                      entityIds: ['aa@narval.xyz', 'bb@narval.xyz']
                    },
                    {
                      approvalCount: 1,
                      countPrincipal: false,
                      approvalEntityType: EntityType.UserRole,
                      entityIds: [UserRole.ADMIN]
                    }
                  ]
                }
              ]
            },
            {
              then: Then.FORBID,
              name: 'exampleForbidPolicy',
              when: [
                {
                  criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
                  args: null
                },
                {
                  criterion: Criterion.CHECK_NONCE_EXISTS,
                  args: null
                },
                {
                  criterion: Criterion.CHECK_ACTION,
                  args: [Action.SIGN_TRANSACTION]
                },
                {
                  criterion: Criterion.CHECK_PRINCIPAL_ID,
                  args: ['matt@narval.xyz']
                },
                {
                  criterion: Criterion.CHECK_WALLET_ID,
                  args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
                },
                {
                  criterion: Criterion.CHECK_INTENT_TYPE,
                  args: [Intents.TRANSFER_NATIVE]
                },
                {
                  criterion: Criterion.CHECK_INTENT_TOKEN,
                  args: ['eip155:137/slip44:966']
                },
                {
                  criterion: Criterion.CHECK_SPENDING_LIMIT,
                  args: {
                    limit: '1000000000000000000',
                    timeWindow: {
                      type: TimeWindow.ROLLING,
                      value: 43200
                    },
                    filters: {
                      tokens: ['eip155:137/slip44:966'],
                      users: ['matt@narval.xyz']
                    }
                  }
                }
              ]
            }
          ]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/policies')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body.policies).toMatchObject(payload.request.data)
      expect(status).toEqual(HttpStatus.CREATED)

      const path = `./apps/authz/src/opa/rego/generated/${body.fileId}.rego`
      const rego = readFileSync(path, 'utf-8')
      expect(rego).toBeDefined()

      unlinkSync(path)
    })
  })
})
