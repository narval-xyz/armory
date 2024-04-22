import { NarvalSdk, NarvalSdkConfig } from '@narval-xyz/sdk/src'

const ensureConfig = (): NarvalSdkConfig => {
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
  const ENGINE_CLIENT_ID = process.env.ENGINE_CLIENT_ID
  if (!ENGINE_CLIENT_ID) {
    throw new Error('ENGINE_CLIENT_ID is required')
  }
  const ENGINE_CLIENT_SECRET = process.env.ENGINE_CLIENT_SECRET
  if (!ENGINE_CLIENT_SECRET) {
    throw new Error('ENGINE_CLIENT_SECRET is required')
  }
  const VAULT_ADMIN_KEY = process.env.VAULT_ADMIN_KEY
  if (!VAULT_ADMIN_KEY) {
    throw new Error('VAULT_ADMIN_KEY is required')
  }
  const VAULT_CLIENT_ID = process.env.VAULT_CLIENT_ID
  if (!VAULT_CLIENT_ID) {
    throw new Error('VAULT_CLIENT_ID is required')
  }
  const VAULT_CLIENT_SECRET = process.env.VAULT_CLIENT_SECRET
  if (!VAULT_CLIENT_SECRET) {
    throw new Error('VAULT_CLIENT_SECRET is required')
  }
  return {
    engine: {
      url: ENGINE_URL,
      adminKey: ENGINE_ADMIN_KEY,
      client: {
        id: ENGINE_CLIENT_ID,
        secret: ENGINE_CLIENT_SECRET
      }
    },
    vault: {
      url: VAULT_URL,
      adminKey: VAULT_ADMIN_KEY,
      client: {
        id: VAULT_CLIENT_ID,
        secret: VAULT_CLIENT_SECRET
      }
    },
    dataStore: {
      entityUrl: process.env.DATA_STORE_ENTITY_URL || 'http://localhost:3111/entities',
      policyUrl: process.env.DATA_STORE_POLICY_URL || 'http://localhost:3111/policies'
    }
  }
}

const default_sdk = new NarvalSdk(ensureConfig())

export default default_sdk
