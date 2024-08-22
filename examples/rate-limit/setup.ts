/* eslint-disable no-console */
import 'dotenv/config'
import fs from 'fs'
import { armoryClient } from './armory.account'
import { setInitialState } from './armory.data'
import { getArmoryConfig } from './armory.sdk'
import { privateKeyToHex } from '@narval-xyz/armory-sdk/signature'
import { Hex } from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'

const main = async () => {
  console.log('Starting...')

  const SYSTEM_MANAGER_KEY = hexSchema.parse(process.env.SYSTEM_MANAGER_KEY?.toLowerCase())
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const vaultAdminApiKey = process.env.VAULT_API_KEY
  const authAdminApiKey = process.env.AUTH_API_KEY

  if (!vaultAdminApiKey || !authHost || !authAdminApiKey || !vaultHost) {
    throw new Error('Missing configuration')
  }
  const config = await getArmoryConfig(SYSTEM_MANAGER_KEY, {
    vaultAdminApiKey,
    vaultHost,
    authAdminApiKey,
    authHost
  })
  const armory = armoryClient(config)

  const ADMIN_USER_ADDR = hexSchema.parse(process.env.ADMIN_USER_ADDR).toLowerCase()
  const MEMBER_USER_ADDR = hexSchema.parse(process.env.MEMBER_USER_ADDR).toLowerCase()
  const { address: signerAddress } = await setInitialState({
    armory,
    userAndCredentials: [
      { credential: ADMIN_USER_ADDR as Hex, role: 'admin' },
      { credential: MEMBER_USER_ADDR as Hex, role: 'member' },
      { credential: SYSTEM_MANAGER_KEY, role: 'manager' }
    ]
  })

  const vaultSigner = await privateKeyToHex(config.vault.signer.jwk)
  const authSigner = await privateKeyToHex(config.auth.signer.jwk)

  if (!config.entityStore.signer || !config.policyStore.signer) {
    throw new Error('Missing signer configuration')
  }
  const entitySigner = await privateKeyToHex(config.entityStore.signer?.jwk)
  const policySigner = await privateKeyToHex(config.policyStore.signer?.jwk)

  const envVariables = {
    VAULT_CLIENT_ID: config.vault.clientId,
    VAULT_SIGNER: vaultSigner,
    AUTH_CLIENT_ID: config.auth.clientId,
    AUTH_SIGNER: authSigner,
    ENTITY_HOST: 'http://localhost:3005',
    ENTITY_CLIENT_ID: config.entityStore.clientId,
    ENTITY_SIGNER: entitySigner,
    POLICY_HOST: 'http://localhost:3005',
    POLICY_CLIENT_ID: config.policyStore.clientId,
    POLICY_SIGNER: policySigner,
    SIGNER_ADDRESS: signerAddress,
  }

  let envContent = ''

  for (const [key, value] of Object.entries(envVariables)) {
    if (!process.env[key]) {
      envContent += `${key}=${value}\n`
    }
  }

  if (envContent) {
    fs.appendFileSync('.env', '\n' + envContent.trim() + '\n')
    console.log('New environment variables appended to .env file')
  } else {
    console.log('All environment variables already exist. No changes made.')
  }

  console.log('Finished')
}

main().catch(console.error)
