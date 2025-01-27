import { Hex, privateKeyToJwk } from '@narval-xyz/armory-sdk'
import { buildSignerEdDSA } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { VaultClient } from '../../packages/armory-sdk/src/lib/vault/client'
dotenv.config()

const configSchema = z.object({
  // Narval variables
  clientId: z.string(),
  narvalAuthPrivateKey: z.string(),
  baseUrl: z.string(),

  // Connection variables
  connectionPrivateKey: z.string(),
  connectionApiKey: z.string(),
  connectionUrl: z.string(),
  connectionId: z.string().nullable(),

  // Transfer variables
  sourceId: z.string().nullable(),
  destinationId: z.string().nullable(),
  destinationType: z.union([z.literal('account'), z.literal('address')]).nullable(),
  destinationAddress: z.string().nullable(),
  amount: z.string().nullable(),
  assetId: z.string().nullable()
})

let config: z.infer<typeof configSchema>
const configPath = path.join(__dirname, 'config.json')
try {
  if (!fs.existsSync(configPath)) {
    const CLIENT_ID = process.env.CLIENT_ID
    const NARVAL_AUTH_PRIVATE_KEY_HEX = process.env.NARVAL_AUTH_PRIVATE_KEY
    const BASE_URL = process.env.BASE_URL

    if (!CLIENT_ID || !NARVAL_AUTH_PRIVATE_KEY_HEX || !BASE_URL) {
      throw new Error('CLIENT_ID or NARVAL_AUTH_PRIVATE_KEY or BASE_URL must be in .env or config.json')
    }

    // Default configuration
    const defaultConfig = {
      clientId: CLIENT_ID,
      narvalAuthPrivateKey: NARVAL_AUTH_PRIVATE_KEY_HEX,
      baseUrl: BASE_URL,
      connectionId: null,
      connectionPrivateKey: '',
      connectionApiKey: '',
      connectionUrl: 'https://api.anchorage-staging.com',
      sourceId: null,
      destinationId: null,
      destinationType: null,
      destinationAddress: null,
      amount: null,
      assetId: null
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    config = defaultConfig
  } else {
    const configFile = fs.readFileSync(configPath, 'utf8')
    config = configSchema.parse(JSON.parse(configFile))
  }
} catch (error) {
  console.error('Error handling config.json:', error)
  throw error
}

if (!config.connectionApiKey || !config.connectionPrivateKey) {
  console.error('Missing `connectionApiKey` or `connectionPrivateKey` in config.json. Please add them and try again.')
  process.exit(1)
}

export const setConfig = (
  key: keyof z.infer<typeof configSchema>,
  value: z.infer<typeof configSchema>[keyof z.infer<typeof configSchema>]
) => {
  const newConfig = configSchema.parse({ ...config, [key]: value })
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
  config = newConfig
}

export { config }

export const vaultClient = new VaultClient({
  clientId: config.clientId,
  signer: {
    sign: buildSignerEdDSA(config.narvalAuthPrivateKey),
    jwk: privateKeyToJwk(config.narvalAuthPrivateKey as Hex, 'EDDSA'),
    alg: 'EDDSA'
  },
  host: config.baseUrl
})
