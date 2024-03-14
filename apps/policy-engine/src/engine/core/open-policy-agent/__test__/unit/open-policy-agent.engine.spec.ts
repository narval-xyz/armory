import { Action, EvaluationRequest, FIXTURE } from '@narval/policy-engine-shared'
import { readFile } from 'fs/promises'
import { OpenPolicyAgentEngine } from '../../open-policy-agent.engine'
import { OpenPolicyAgentException } from '../../open-policy-agent.exception'

const OPA_WASM_PATH = '/Users/wcalderipe/dev/narval/armory/rego-build/policy.wasm'

describe('OpenPolicyAgentEngine', () => {
  describe('constructor', () => {
    it('starts with an empty state', () => {
      const engine = new OpenPolicyAgentEngine(Buffer.alloc(1))

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
      const engine = new OpenPolicyAgentEngine(Buffer.alloc(1))

      expect(engine.setPolicies(FIXTURE.POLICIES).getPolicies()).toEqual(FIXTURE.POLICIES)
    })
  })

  describe('setEntities', () => {
    it('sets entities', () => {
      const engine = new OpenPolicyAgentEngine(Buffer.alloc(1))

      expect(engine.setEntities(FIXTURE.ENTITIES).getEntities()).toEqual(FIXTURE.ENTITIES)
    })
  })

  describe('load', () => {
    it('throws OpenPolicyAgentException when it fails to load', async () => {
      const badOpaWasm = Buffer.alloc(1)
      const engine = new OpenPolicyAgentEngine(badOpaWasm)

      await expect(() => engine.load()).rejects.toThrow(OpenPolicyAgentException)
    })

    it('resolves with the engine implementation', async () => {
      const wasm = await readFile(OPA_WASM_PATH)

      const engine = await new OpenPolicyAgentEngine(wasm).load()

      console.log(engine?.opa)
      console.log(engine?.wasm)
    })
  })

  describe('evaluate', () => {
    let engine: OpenPolicyAgentEngine

    beforeEach(async () => {
      const wasm = await readFile(OPA_WASM_PATH)
      engine = await new OpenPolicyAgentEngine(wasm).load()
    })

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
