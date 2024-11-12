import { ConfigModule, ConfigService } from '@narval/config-module'
import {
  Action,
  Criterion,
  Decision,
  Eip712TypedData,
  Entities,
  EntityType,
  EvaluationRequest,
  FIXTURE,
  Hex,
  JwtString,
  Policy,
  Request,
  SignMessageAction,
  Then,
  ValueOperators,
  toHex
} from '@narval/policy-engine-shared'
import { SigningAlg, buildSignerEip191, hash, secp256k1PrivateKeyToJwk, signJwt } from '@narval/signature'
import { Path, PathValue } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Config, load } from '../../../../policy-engine.config'
import { OpenPolicyAgentException } from '../../exception/open-policy-agent.exception'
import { OpenPolicyAgentEngine } from '../../open-policy-agent.engine'
import { Result } from '../../type/open-policy-agent.type'

const ONE_ETH = toHex(BigInt('1000000000000000000'))

const getJwt = (option: { privateKey: Hex; request: Request; sub: string }): Promise<JwtString> => {
  const jwk = secp256k1PrivateKeyToJwk(option.privateKey)
  const signer = buildSignerEip191(option.privateKey)

  return signJwt(
    {
      requestHash: hash(option.request),
      sub: option.sub
    },
    jwk,
    { alg: SigningAlg.EIP191 },
    signer
  )
}

const getConfig = async <P extends Path<Config>>(propertyPath: P): Promise<PathValue<Config, P>> => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ load: [load] })]
  }).compile()

  const service = module.get<ConfigService<Config>>(ConfigService)

  return service.get(propertyPath)
}

describe('OpenPolicyAgentEngine', () => {
  let engine: OpenPolicyAgentEngine

  beforeEach(async () => {
    engine = await OpenPolicyAgentEngine.empty({
      resourcePath: await getConfig('resourcePath')
    }).load()
  })

  describe('empty', () => {
    it('starts with an empty state', async () => {
      const e = OpenPolicyAgentEngine.empty({
        resourcePath: await getConfig('resourcePath')
      })

      expect(e.getPolicies()).toEqual([])
      expect(e.getEntities()).toEqual({
        addressBook: [],
        credentials: [],
        tokens: [],
        userGroupMembers: [],
        accountGroups: [],
        userGroups: [],
        groups: [],
        groupMembers: [],
        userAccounts: [],
        users: [],
        accountGroupMembers: [],
        accounts: []
      })
    })
  })

  describe('setPolicies', () => {
    it('sets policies', () => {
      expect(engine.setPolicies(FIXTURE.POLICIES).getPolicies()).toEqual(FIXTURE.POLICIES)
    })
  })

  describe('setEntities', () => {
    it('sets entities', () => {
      expect(engine.setEntities(FIXTURE.ENTITIES).getEntities()).toEqual(FIXTURE.ENTITIES)
    })
  })

  describe('load', () => {
    it('sets opa engine', async () => {
      const e = await engine.setPolicies(FIXTURE.POLICIES).load()

      expect(e.getOpenPolicyAgentInstance()).toBeDefined()
    })
  })

  describe('evaluate', () => {
    it('throws OpenPolicyAgentException when action is unsupported', async () => {
      const request = {
        action: 'UNSUPPORTED ACTION',
        nonce: 'test-nonce',
        resourceId: 'test-resource-id',
        message: 'test-message'
      }
      const evaluation = {
        request,
        authentication: await getJwt({
          privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice,
          sub: FIXTURE.USER.Alice.id,
          request: request as SignMessageAction
        })
      }

      await expect(() => engine.evaluate(evaluation as EvaluationRequest)).rejects.toThrow(OpenPolicyAgentException)
    })

    it('evaluates a forbid rule', async () => {
      const policies: Policy[] = [
        {
          id: 'test-forbid-policy-uid',
          then: Then.FORBID,
          description: 'test-policy',
          when: [
            {
              criterion: Criterion.CHECK_ACTION,
              args: [Action.SIGN_TRANSACTION]
            }
          ]
        }
      ]

      const e = await new OpenPolicyAgentEngine({
        policies,
        entities: FIXTURE.ENTITIES,
        resourcePath: await getConfig('resourcePath')
      }).load()

      const request = {
        action: Action.SIGN_TRANSACTION,
        nonce: 'test-nonce',
        transactionRequest: {
          from: FIXTURE.ACCOUNT.Engineering.address,
          to: FIXTURE.ACCOUNT.Testing.address,
          value: ONE_ETH,
          chainId: 1
        },
        resourceId: FIXTURE.ACCOUNT.Engineering.id
      }

      const evaluation: EvaluationRequest = {
        request,
        authentication: await getJwt({
          privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice,
          sub: FIXTURE.USER.Alice.id,
          request
        })
      }

      const response = await e.evaluate(evaluation)

      expect(response).toEqual({
        decision: Decision.FORBID,
        request: evaluation.request,
        transactionRequestIntent: {
          amount: '1000000000000000000',
          from: 'eip155:1:0x9f38879167accf7401351027ee3f9247a71cd0c5',
          to: 'eip155:1:0x0f610ac9f0091f8f573c33f15155afe8ad747495',
          token: 'eip155:1/slip44:60',
          type: 'transferNative'
        }
      })
    })

    it('adds principal on permit responses', async () => {
      const policies: Policy[] = [
        {
          id: 'test-permit-policy-uid',
          then: Then.PERMIT,
          description: 'test-policy',
          when: [
            {
              criterion: Criterion.CHECK_ACTION,
              args: [Action.SIGN_TRANSACTION]
            }
          ]
        }
      ]

      const e = await new OpenPolicyAgentEngine({
        policies,
        entities: FIXTURE.ENTITIES,
        resourcePath: await getConfig('resourcePath')
      }).load()

      const request = {
        action: Action.SIGN_TRANSACTION,
        nonce: 'test-nonce',
        transactionRequest: {
          from: FIXTURE.ACCOUNT.Engineering.address,
          to: FIXTURE.ACCOUNT.Testing.address,
          value: ONE_ETH,
          chainId: 1
        },
        resourceId: FIXTURE.ACCOUNT.Engineering.id
      }

      const evaluation: EvaluationRequest = {
        authentication: await getJwt({
          privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice,
          sub: FIXTURE.USER.Alice.id,
          request
        }),
        request
      }

      const response = await e.evaluate(evaluation)

      expect(response.decision).toEqual(Decision.PERMIT)
      expect(response.principal).toEqual(FIXTURE.CREDENTIAL.Alice)
    })
  })

  describe('decide', () => {
    it('returns forbid when any of the reasons is forbid', () => {
      const results: Result[] = [
        {
          permit: false,
          reasons: [
            {
              policyId: 'forbid-rule-id',
              policyName: 'Forbid Rule',
              type: 'forbid',
              approvalsMissing: [],
              approvalsSatisfied: []
            },
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [],
              approvalsSatisfied: []
            }
          ]
        }
      ]

      const result = engine.decide(results)

      expect(result.decision).toEqual(Decision.FORBID)
    })

    it('returns permit when all of the reasons are permit', () => {
      const results: Result[] = [
        {
          permit: true,
          reasons: [
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [],
              approvalsSatisfied: []
            },
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [],
              approvalsSatisfied: []
            }
          ]
        }
      ]

      const result = engine.decide(results)

      expect(result.decision).toEqual(Decision.PERMIT)
    })

    it('returns confirm when any of the reasons are forbid for a permit type rule where approvals are missing', () => {
      const results: Result[] = [
        {
          permit: false,
          reasons: [
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [
                {
                  approvalCount: 1,
                  approvalEntityType: EntityType.User,
                  entityIds: ['user-id'],
                  countPrincipal: true
                }
              ],
              approvalsSatisfied: []
            }
          ]
        }
      ]

      const result = engine.decide(results)

      expect(result.decision).toEqual(Decision.CONFIRM)
    })

    it('returns all missing, satisfied, and total approvals', () => {
      const missingApproval = {
        policyId: 'permit-rule-id',
        approvalCount: 1,
        approvalEntityType: EntityType.User,
        entityIds: ['user-id'],
        countPrincipal: true
      }
      const missingApproval2 = {
        policyId: 'permit-rule-id-4',
        approvalCount: 1,
        approvalEntityType: EntityType.User,
        entityIds: ['user-id'],
        countPrincipal: true
      }
      const satisfiedApproval = {
        policyId: 'permit-rule-id-2',
        approvalCount: 1,
        approvalEntityType: EntityType.User,
        entityIds: ['user-id'],
        countPrincipal: true
      }
      const satisfiedApproval2 = {
        policyId: 'permit-rule-id-3',
        approvalCount: 1,
        approvalEntityType: EntityType.User,
        entityIds: ['user-id'],
        countPrincipal: true
      }
      const results: Result[] = [
        {
          permit: false,
          reasons: [
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [missingApproval],
              approvalsSatisfied: [satisfiedApproval]
            }
          ]
        },
        {
          permit: false,
          reasons: [
            {
              policyId: 'permit-rule-id',
              policyName: 'Permit Rule',
              type: 'permit',
              approvalsMissing: [missingApproval2],
              approvalsSatisfied: [satisfiedApproval2]
            }
          ]
        }
      ]

      const result = engine.decide(results)

      expect(result).toEqual({
        decision: Decision.CONFIRM,
        approvals: {
          required: [missingApproval, missingApproval2, satisfiedApproval, satisfiedApproval2],
          missing: [missingApproval, missingApproval2],
          satisfied: [satisfiedApproval, satisfiedApproval2]
        }
      })
    })
  })

  describe('scenario testing', () => {
    describe('checkDestinationClassification', () => {
      // Sample policy & data for this specific set of
      // checkDestinationClassification scenarios.
      const policies: Policy[] = [
        {
          id: '1-allow-internal-transfers',
          description: 'Permit accounts to transfer between each other or to whitelisted internal address',
          when: [
            {
              criterion: 'checkIntentType',
              args: ['transferNative', 'transferErc20', 'transferErc721', 'transferErc1155']
            },
            {
              criterion: 'checkDestinationClassification',
              args: ['managed', 'internal']
            }
          ],
          then: 'permit'
        }
      ]

      // NOTE: this references Alice for the Credentials, but we're not
      // importing from dev.fixtures.ts because we want this to be
      // copy-pasteable as the actual JSON, so it can be e2e tested outside
      // this unit test.
      const entities: Entities = {
        addressBook: [
          {
            id: 'eip155:1:0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            address: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            chainId: 1,
            classification: 'internal'
          },
          {
            id: 'eip155:1:0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            address: '0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            chainId: 1,
            classification: 'counterparty'
          }
        ],
        credentials: [
          {
            userId: 'test-alice-user-uid',
            id: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
            key: {
              kty: 'EC',
              alg: 'ES256K',
              kid: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
              crv: 'secp256k1',
              x: 'zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY',
              y: '6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs'
            }
          }
        ],
        userGroups: [],
        accountGroups: [],
        tokens: [],
        userGroupMembers: [],
        userAccounts: [],
        users: [
          {
            id: 'test-alice-user-uid',
            role: 'admin'
          }
        ],
        accountGroupMembers: [],
        accounts: [
          {
            id: 'eip155:eoa:0x0301e2724a40E934Cce3345928b88956901aA127',
            address: '0x0301e2724a40E934Cce3345928b88956901aA127',
            accountType: 'eoa'
          },
          {
            id: 'eip155:eoa:0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            address: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            accountType: 'eoa'
          }
        ]
      }

      it('permits transfers between implicit managed accounts not in address book', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: '0xde0b6b3a7640000', // 1 ETH
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40E934Cce3345928b88956901aA127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice, // My Credential in Entities above is Alice;
            sub: FIXTURE.USER.Alice.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.PERMIT)
      })

      it('permits transfers to account classified internal in address book', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            value: '0xde0b6b3a7640000', // 1 ETH
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40E934Cce3345928b88956901aA127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice, // My Credential in Entities above is Alice;
            sub: FIXTURE.USER.Alice.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.PERMIT)
      })

      it('forbids transfer to account classified counterparty in address book', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            value: '0xde0b6b3a7640000', // 1 ETH
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40E934Cce3345928b88956901aA127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice, // My Credential in Entities above is Alice;
            sub: FIXTURE.USER.Alice.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })
    })
    describe('checkIntentTypedDataMessage', () => {
      const immutableTypedData = {
        types: {
          EIP712Domain: [
            {
              name: 'chainId',
              type: 'uint256'
            }
          ],
          LinkWallet: [
            {
              name: 'walletAddress',
              type: 'address'
            },
            {
              name: 'immutablePassportAddress',
              type: 'address'
            },
            {
              name: 'condition',
              type: 'string'
            },
            {
              name: 'nonce',
              type: 'string'
            }
          ]
        },
        primaryType: 'LinkWallet',
        domain: {
          chainId: '1'
        },
        message: {
          walletAddress: '0x299697552cd035afd7e08600c4001fff48498263',
          immutablePassportAddress: '0xfa9582594f460d3cad2095f6270996ac25f89874',
          condition: 'I agree to link this wallet to my Immutable Passport account.',
          nonce: 'mTu2kYHDG9jt9ZTIp'
        }
      } as unknown as Eip712TypedData

      it('permits Immutable log-in typed data with message.condition policy and assigned account', async () => {
        const immutablePolicy: Policy[] = [
          {
            id: 'test-permit-login-uid',
            then: 'permit',
            description: 'permits immutable login with assigned account',
            when: [
              {
                criterion: 'checkIntentTypedDataMessage',
                args: [
                  [
                    {
                      key: 'condition',
                      value: 'I agree to link this wallet to my Immutable Passport account.'
                    }
                  ]
                ]
              },
              {
                criterion: 'checkAccountAssigned',
                args: null
              }
            ]
          }
        ]

        const e = await engine.setPolicies(immutablePolicy).setEntities(FIXTURE.ENTITIES).load()

        const request = {
          action: Action.SIGN_TYPED_DATA,
          nonce: 'test-nonce',
          typedData: immutableTypedData,
          resourceId: 'eip155:eoa:0x0f610AC9F0091f8F573c33f15155afE8aD747495'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Alice,
            sub: FIXTURE.USER.Alice.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)
        expect(response.decision).toEqual(Decision.PERMIT)
        expect(response.principal).toEqual(FIXTURE.CREDENTIAL.Alice)
      })
    })

    describe('checkIntentAmount', () => {
      const policies: Policy[] = [
        {
          id: 'can transfer 1 wei',
          description: 'Permit to transfer up to 1 wei',
          when: [
            {
              criterion: 'checkIntentAmount',
              args: {
                value: '1',
                operator: 'lte' as ValueOperators
              }
            }
          ],
          then: 'permit'
        }
      ]

      const entities = FIXTURE.ENTITIES

      it('permits a transfer of 1 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: '0x1',
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.PERMIT)
      })

      it('forbids a transfer of 2 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: '0x2',
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })

      it('forbids a transfer of 9223372036854775295 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: '0x7FFFFFFFFFFFFDFF',
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })

      it('forbids a transfer of 9223372036854775296 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: toHex(9223372036854775296n),
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })

      it('forbids a transfer of rounded 9223372036854776000 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: toHex(9223372036854776000n),
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })
      it('forbids a transfer of 9223372036854775808  wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: toHex(9223372036854775808n),
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })
      it('forbids a transfer of 18446744073709551617  wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: toHex(18446744073709552102n),
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })

      // 10k eth
      it('forbids a transfer of 10000000000000000000000 wei', async () => {
        const e = await new OpenPolicyAgentEngine({
          policies,
          entities,
          resourcePath: await getConfig('resourcePath')
        }).load()

        const request: Request = {
          action: Action.SIGN_TRANSACTION,
          nonce: 'test-nonce',
          transactionRequest: {
            from: '0x0301e2724a40E934Cce3345928b88956901aA127',
            to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
            value: toHex(10000000000000000000000n),
            chainId: 1
          },
          resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
        }

        const evaluation: EvaluationRequest = {
          authentication: await getJwt({
            privateKey: FIXTURE.UNSAFE_PRIVATE_KEY.Bob,
            sub: FIXTURE.USER.Bob.id,
            request
          }),
          request
        }

        const response = await e.evaluate(evaluation)

        expect(response.decision).toEqual(Decision.FORBID)
      })
    })
  })
})
