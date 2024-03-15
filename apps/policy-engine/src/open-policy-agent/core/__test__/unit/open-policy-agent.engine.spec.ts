import { Action, EvaluationRequest, FIXTURE } from '@narval/policy-engine-shared'
import { OpenPolicyAgentException } from '../../exception/open-policy-agent.exception'
import { OpenPolicyAgentEngine } from '../../open-policy-agent.engine'

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
  })
})
