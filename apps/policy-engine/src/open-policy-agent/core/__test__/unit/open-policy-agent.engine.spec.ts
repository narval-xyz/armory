import {
  Action,
  Criterion,
  Decision,
  EntityType,
  EvaluationRequest,
  FIXTURE,
  Hex,
  JwtString,
  Policy,
  Request,
  Then,
  toHex
} from '@narval/policy-engine-shared'
import { SigningAlg, buildSignerEip191, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { ConfigModule, ConfigService, Path, PathValue } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { resolve } from 'path'
import { Config, load } from '../../../../policy-engine.config'
import { OpenPolicyAgentException } from '../../exception/open-policy-agent.exception'
import { OpenPolicyAgentEngine } from '../../open-policy-agent.engine'
import { Result } from '../../type/open-policy-agent.type'

const ONE_ETH = toHex(BigInt('1000000000000000000'))

const REGO_CORE_PATH = resolve(__dirname, '../../rego')

const getJwt = (option: { privateKey: Hex; request: Request; sub: string }): Promise<JwtString> => {
  const jwk = privateKeyToJwk(option.privateKey)
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

  const service = module.get<ConfigService<Config, true>>(ConfigService)

  return service.get(propertyPath, { infer: true })
}

describe('OpenPolicyAgentEngine', () => {
  let engine: OpenPolicyAgentEngine

  beforeEach(async () => {
    engine = await OpenPolicyAgentEngine.empty(await getConfig('resourcePath')).load()
  })

  describe('empty', () => {
    it('starts with an empty state', async () => {
      const e = OpenPolicyAgentEngine.empty(await getConfig('resourcePath'))

      expect(e.getPolicies()).toEqual([])
      expect(e.getEntities()).toEqual({
        addressBook: [],
        credentials: [],
        tokens: [],
        userGroupMembers: [],
        userGroups: [],
        userWallets: [],
        users: [],
        walletGroupMembers: [],
        walletGroups: [],
        wallets: []
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
      const request: Partial<EvaluationRequest> = {
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: 'test-nonce',
          resourceId: 'test-resource-id',
          message: 'test-message'
        }
      }

      await expect(() => engine.evaluate(request as EvaluationRequest)).rejects.toThrow(OpenPolicyAgentException)
    })

    it('evaluates a forbid rule', async () => {
      const policies: Policy[] = [
        {
          then: Then.FORBID,
          name: 'test-policy',
          when: [
            {
              criterion: Criterion.CHECK_ACTION,
              args: [Action.SIGN_TRANSACTION]
            },
            {
              criterion: Criterion.CHECK_PRINCIPAL_ID,
              args: [FIXTURE.USER.Alice.id]
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
          from: FIXTURE.WALLET.Engineering.address,
          to: FIXTURE.WALLET.Testing.address,
          value: ONE_ETH,
          chainId: 1
        },
        resourceId: FIXTURE.WALLET.Engineering.id
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

      expect(response).toEqual({
        decision: Decision.FORBID,
        request: evaluation.request
      })
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
})
