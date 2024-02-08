import { AccountClassification, AccountType, Action, Alg, Signature, UserRole } from '@narval/authz-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import request from 'supertest'
import { AppModule } from '../../../app/app.module'
import { AAUser, AAUser_Credential_1 } from '../../../app/persistence/repository/mock_data'
import { PersistenceModule } from '../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { Organization } from '../../../shared/types/entities.types'
import { load } from '../../app.config'

const REQUEST_HEADER_ORG_ID = 'x-org-id'
describe('Admin Endpoints', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

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
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        PersistenceModule,
        AppModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.getClient().organization.create({ data: org })
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('POST /admin/organizations', () => {
    it('creates a new organization', async () => {
      // Clear the db since we create an org in beforeEach
      await testPrismaService.truncateAll()

      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_ORGANIZATION,
          nonce: 'random-nonce-111',
          organization: {
            uid: org.uid,
            credential: AAUser_Credential_1
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/organizations')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toMatchObject({ organization: org })
    })
  })

  describe('POST /admin/users', () => {
    it('creates a new user & credential', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce: 'random-nonce-111',
          user: {
            ...AAUser,
            credential: AAUser_Credential_1
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/users')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        user: AAUser
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('creates a new user without credential', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce: 'random-nonce-111',
          user: AAUser
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/users')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        user: AAUser
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('errors on duplicate', async () => {
      expect.assertions(3)

      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.CREATE_USER,
          nonce: 'random-nonce-111',
          user: AAUser
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/users')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      // Repeat it
      const { status: duplicateStatus } = await request(app.getHttpServer())
        .post('/admin/users')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({ user: AAUser })
      expect(status).toEqual(HttpStatus.CREATED)
      expect(duplicateStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /admin/users/:uid', () => {
    it('updates a user', async () => {
      // First, insert the user who is an ADMIN
      await testPrismaService.getClient().user.create({
        data: {
          ...AAUser,
          role: UserRole.ADMIN
        }
      })
      const payload = {
        authentication,
        approvals,
        request: {
          action: Action.UPDATE_USER,
          nonce: 'random-nonce-111',
          user: {
            ...AAUser,
            role: UserRole.MEMBER
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .patch(`/admin/users/${AAUser.uid}`)
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        user: {
          ...AAUser,
          role: UserRole.MEMBER
        }
      })
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('POST /admin/credentials', () => {
    it(`creates a new credential`, async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.CREATE_CREDENTIAL,
          credential: AAUser_Credential_1
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/credentials')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        credential: AAUser_Credential_1
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /user-groups', () => {
    it('creates a new user group', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.ASSIGN_USER_GROUP,
          data: {
            userId: AAUser.uid,
            groupId: 'test-user-group-uid'
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/user-groups')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        data: {
          userId: AAUser.uid,
          groupId: 'test-user-group-uid'
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /wallets', () => {
    it('creates a new wallet', async () => {
      // TODO: This data _should_ fail a test later once we add validations.
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.REGISTER_WALLET,
          wallet: {
            uid: 'test-wallet-uid',
            address: '0x1234',
            accountType: AccountType.EOA,
            chainId: 1
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/wallets')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        wallet: {
          uid: 'test-wallet-uid',
          address: '0x1234',
          accountType: AccountType.EOA,
          chainId: 1
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /wallet-groups', () => {
    it('creates a new wallet group', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.ASSIGN_WALLET_GROUP,
          data: {
            walletId: 'test-wallet-uid',
            groupId: 'test-wallet-group-uid'
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/wallet-groups')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        data: {
          walletId: 'test-wallet-uid',
          groupId: 'test-wallet-group-uid'
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /user-wallets', () => {
    it('creates a new user wallet', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.ASSIGN_USER_WALLET,
          data: {
            userId: AAUser.uid,
            walletId: 'test-wallet-uid'
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/user-wallets')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        data: {
          userId: AAUser.uid,
          walletId: 'test-wallet-uid'
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /address-book', () => {
    it('creates a new address book entry', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce-111',
          action: Action.CREATE_ADDRESS_BOOK_ACCOUNT,
          account: {
            uid: 'test-address-book-uid',
            address: '0x1234',
            chainId: 1,
            classification: AccountClassification.INTERNAL
          }
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/address-book')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        account: {
          uid: 'test-address-book-uid',
          address: '0x1234',
          chainId: 1,
          classification: AccountClassification.INTERNAL
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /tokens', () => {
    it('registers new tokens', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          nonce: 'random-nonce',
          action: Action.REGISTER_TOKENS,
          tokens: [
            {
              uid: 'test-token-uid',
              address: '0x1234',
              chainId: 1,
              symbol: 'TT',
              decimals: 18
            },
            {
              uid: 'test-token-uid-2',
              address: '0x1234',
              chainId: 137,
              symbol: 'TT2',
              decimals: 6
            }
          ]
        }
      }

      const { status, body } = await request(app.getHttpServer())
        .post('/admin/tokens')
        .set(REQUEST_HEADER_ORG_ID, org.uid)
        .send(payload)

      expect(body).toMatchObject({
        tokens: payload.request.tokens
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })
  })

  describe('POST /policies', () => {
    it('sets the organization policies', async () => {
      const payload = {
        authentication,
        approvals,
        request: {
          action: 'setPolicyRules',
          nonce: 'random-nonce-111',
          data: [
            {
              then: 'permit',
              name: 'examplePermitPolicy',
              when: [
                {
                  criterion: 'checkResourceIntegrity',
                  args: null
                },
                {
                  criterion: 'checkNonceExists',
                  args: null
                },
                {
                  criterion: 'checkAction',
                  args: ['signTransaction']
                },
                {
                  criterion: 'checkPrincipalId',
                  args: ['matt@narval.xyz']
                },
                {
                  criterion: 'checkWalletId',
                  args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
                },
                {
                  criterion: 'checkIntentType',
                  args: ['transferNative']
                },
                {
                  criterion: 'checkIntentToken',
                  args: ['eip155:137/slip44:966']
                },
                {
                  criterion: 'checkIntentAmount',
                  args: {
                    currency: '*',
                    operator: 'lte',
                    value: '1000000000000000000'
                  }
                },
                {
                  criterion: 'checkApprovals',
                  args: [
                    {
                      approvalCount: 2,
                      countPrincipal: false,
                      approvalEntityType: 'Narval::User',
                      entityIds: ['aa@narval.xyz', 'bb@narval.xyz']
                    },
                    {
                      approvalCount: 1,
                      countPrincipal: false,
                      approvalEntityType: 'Narval::UserRole',
                      entityIds: ['admin']
                    }
                  ]
                }
              ]
            },
            {
              then: 'forbid',
              name: 'exampleForbidPolicy',
              when: [
                {
                  criterion: 'checkResourceIntegrity',
                  args: null
                },
                {
                  criterion: 'checkNonceExists',
                  args: null
                },
                {
                  criterion: 'checkAction',
                  args: ['signTransaction']
                },
                {
                  criterion: 'checkPrincipalId',
                  args: ['matt@narval.xyz']
                },
                {
                  criterion: 'checkWalletId',
                  args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
                },
                {
                  criterion: 'checkIntentType',
                  args: ['transferNative']
                },
                {
                  criterion: 'checkIntentToken',
                  args: ['eip155:137/slip44:966']
                },
                {
                  criterion: 'checkSpendingLimit',
                  args: {
                    limit: '1000000000000000000',
                    timeWindow: {
                      type: 'rolling',
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
      expect(existsSync(path)).toBeFalsy()
    })
  })
})
