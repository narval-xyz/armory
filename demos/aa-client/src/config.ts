import { Config } from '@narval/sdk'
import { Alg, Jwk, generateJwk } from '@narval/signature'
import axios from 'axios'

const onboard = async (
  engineUrl: string,
  apiKey: string,
  entityDataStoreUrl: string,
  policyDataStoreUrl: string,
  jwk: Jwk
) => {
  const { data: client } = await axios.post(
    `${engineUrl}/clients`,
    {
      entityDataStore: {
        dataUrl: entityDataStoreUrl,
        signatureUrl: entityDataStoreUrl,
        keys: [jwk]
      },
      policyDataStore: {
        dataUrl: policyDataStoreUrl,
        signatureUrl: policyDataStoreUrl,
        keys: [jwk]
      }
    },
    {
      headers: {
        'x-api-key': apiKey
      }
    }
  )
  return client
}

const ensureConfig = async (): Promise<Config> => {
  const ENGINE_URL = process.env.ENGINE_URL
  if (!ENGINE_URL) {
    throw new Error('ENGINE_URL is required')
  }
  const VAULT_URL = process.env.VAULT_URL
  if (!VAULT_URL) {
    throw new Error('VAULT_URL is required')
  }
  const ENGINE_ADMIN_KEY = process.env.ENGINE_ADMIN_KEY
  if (!ENGINE_ADMIN_KEY) {
    throw new Error('ENGINE_ADMIN_KEY is required')
  }
  const VAULT_ADMIN_KEY = process.env.VAULT_ADMIN_KEY
  if (!VAULT_ADMIN_KEY) {
    throw new Error('VAULT_ADMIN_KEY is required')
  }
  const POLICY_URL = process.env.POLICY_URL
  if (!POLICY_URL) {
    throw new Error('POLICY_URL is required')
  }
  const ENTITY_URL = process.env.ENTITY_URL
  if (!ENTITY_URL) {
    throw new Error('ENTITY_URL is required')
  }
  const jwk = await generateJwk(Alg.ES256K, { keyId: 'narval-aa-client' })
  const client = await onboard(ENGINE_URL, ENGINE_ADMIN_KEY, ENTITY_URL, POLICY_URL, jwk)
  const { clientId: id, clientSecret: secret, signer } = client
  const { publicKey: pubKey } = signer

  return {
    engine: {
      url: ENGINE_URL,
      adminKey: ENGINE_ADMIN_KEY,
      id,
      secret,
      pubKey
    },
    vault: {
      url: VAULT_URL,
      adminKey: VAULT_ADMIN_KEY,
      id,
      secret,
      pubKey
    },
    dataStore: {
      policyUrl: POLICY_URL,
      entityUrl: ENTITY_URL,
      clientId: id
    },
    signConfig: {
      jwk
    }
  }
}

export default ensureConfig
