import { SourceType } from '@narval/policy-engine-shared'
import { PublicKey, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { constant, times } from 'lodash'
import { generatePrivateKey } from 'viem/accounts'
import { createHttpDataStore } from '../../util'

const generateKeys = (n = 1): PublicKey[] => times(n, constant(getPublicKey(privateKeyToJwk(generatePrivateKey()))))

describe('createHttpDataStore', () => {
  const host = 'http://localhost'
  const clientId = 'test-client-id'

  const entitySource = {
    type: SourceType.HTTP,
    url: `${host}/v1/data/entities?clientId=${clientId}`
  }

  const policySource = {
    type: SourceType.HTTP,
    url: `${host}/v1/data/policies?clientId=${clientId}`
  }

  it('returns a data store with the same source for entities and policies', () => {
    const keys = generateKeys()

    const dataStore = createHttpDataStore({
      host,
      clientId,
      keys
    })

    expect(dataStore).toEqual({
      entity: {
        data: entitySource,
        signature: entitySource,
        keys
      },
      policy: {
        data: policySource,
        signature: policySource,
        keys
      }
    })
  })

  it('allows to override the entity store keys', () => {
    const keys = generateKeys()
    const entityStoreKeys = generateKeys(2)

    const dataStore = createHttpDataStore({
      host,
      clientId,
      keys,
      entityStoreKeys
    })

    expect(dataStore).toEqual({
      entity: {
        data: entitySource,
        signature: entitySource,
        keys: entityStoreKeys
      },
      policy: {
        data: policySource,
        signature: policySource,
        keys
      }
    })
  })

  it('allows to override the policy store keys', () => {
    const keys = generateKeys()
    const policyStoreKeys = generateKeys(2)

    const dataStore = createHttpDataStore({
      host,
      clientId,
      keys,
      policyStoreKeys
    })

    expect(dataStore).toEqual({
      entity: {
        data: entitySource,
        signature: entitySource,
        keys
      },
      policy: {
        data: policySource,
        signature: policySource,
        keys: policyStoreKeys
      }
    })
  })
})
