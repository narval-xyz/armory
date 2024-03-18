import {
  Action,
  Criterion,
  Decision,
  EntityType,
  EvaluationRequest,
  FIXTURE,
  Policy,
  Then,
  toHex
} from '@narval/policy-engine-shared'
import { OpenPolicyAgentException } from '../../exception/open-policy-agent.exception'
import { OpenPolicyAgentEngine } from '../../open-policy-agent.engine'
import { Result } from '../../type/open-policy-agent.type'

const ONE_ETH = toHex(BigInt('1000000000000000000'))

describe('OpenPolicyAgentEngine', () => {
  let engine: OpenPolicyAgentEngine

  beforeEach(async () => {
    engine = await new OpenPolicyAgentEngine().load()
  })

  describe('constructor', () => {
    it('starts with an empty state', () => {
      expect(engine.getPolicies()).toEqual([])
      expect(engine.getEntities()).toEqual({
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

      const e = await new OpenPolicyAgentEngine(policies, FIXTURE.ENTITIES).load()

      const evaluation: EvaluationRequest = {
        authentication: 'test-authentication',
        request: {
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
      const response: Result[] = [
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

      const result = engine.decide(response)

      expect(result.decision).toEqual(Decision.FORBID)
    })

    it('returns permit when all of the reasons are permit', () => {
      const response: Result[] = [
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

      const result = engine.decide(response)

      expect(result.decision).toEqual(Decision.PERMIT)
    })

    it('returns confirm when any of the reasons are forbid for a permit type rule where approvals are missing', () => {
      const response: Result[] = [
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

      const result = engine.decide(response)

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
      const response: Result[] = [
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
      const result = engine.decide(response)

      expect(result).toEqual({
        originalResponse: response,
        decision: Decision.CONFIRM,
        totalApprovalsRequired: [missingApproval, missingApproval2, satisfiedApproval, satisfiedApproval2],
        approvalsMissing: [missingApproval, missingApproval2],
        approvalsSatisfied: [satisfiedApproval, satisfiedApproval2]
      })
    })
  })
})
