/* eslint-disable no-console */
import 'dotenv/config'
import fs from 'fs'
import { hexSchema } from '../../packages/policy-engine-shared/src'
import { armoryClient } from './armory.account'
import { setInitialState } from './armory.data'
import { getArmoryConfig } from './armory.sdk'
import { privateKeyToHex } from '@narval-xyz/armory-sdk/signature'
import { Hex } from '@narval-xyz/armory-sdk'

const main = async () => {
  console.log('Starting...')

  const SYSTEM_MANAGER_KEY = hexSchema.parse(process.env.SYSTEM_MANAGER_KEY?.toLowerCase())
  const config = await getArmoryConfig(SYSTEM_MANAGER_KEY)
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
    VAULT_HOST: 'http://localhost:3011',
    VAULT_CLIENT_ID: config.vault.clientId,
    VAULT_SIGNER: vaultSigner,
    AUTH_HOST: 'http://localhost:3005',
    AUTH_CLIENT_ID: config.auth.clientId,
    AUTH_SIGNER: authSigner,
    ENTITY_HOST: 'http://localhost:3005',
    ENTITY_CLIENT_ID: config.entityStore.clientId,
    ENTITY_SIGNER: entitySigner,
    ENTITY_CLIENT_SECRET: process.env.ENTITY_CLIENT_SECRET || 'your-secret-here',
    POLICY_HOST: 'http://localhost:3005',
    POLICY_CLIENT_ID: config.policyStore.clientId,
    POLICY_SIGNER: policySigner,
    POLICY_CLIENT_SECRET: process.env.POLICY_CLIENT_SECRET || 'your-secret-here',
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
