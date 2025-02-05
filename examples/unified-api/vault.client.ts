import { Hex, privateKeyToJwk, VaultClient } from '@narval-xyz/armory-sdk'
import { buildSignerEdDSA } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import fs from 'fs'
import { cloneDeep, set } from 'lodash'
import path from 'path'
import * as YAML from 'yaml'
import { z } from 'zod'

dotenv.config()

const Config = z.object({
  // Narval variables
  clientId: z.string(),
  narvalAuthPrivateKey: z.string(),
  baseUrl: z.string(),

  // Connection variables
  connection: z.object({
    url: z.string(),
    id: z.string().nullable(),
    credentials: z.object({
      apiKey: z.string(),
      privateKey: z.string()
    })
  }),

  // Transfer variables
  sourceId: z.string().nullable(),
  destinationId: z.string().nullable(),
  destinationType: z.union([z.literal('account'), z.literal('address')]).nullable(),
  destinationAddress: z.string().nullable(),
  amount: z.string().nullable(),
  assetId: z.string().nullable()
})
type Config = z.infer<typeof Config>

let config: Config

const configPath = path.join(__dirname, 'config.yaml')

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
      sourceId: null,
      destinationId: null,
      destinationType: null,
      destinationAddress: null,
      amount: null,
      assetId: null,
      connection: {
        id: null,
        url: 'https://api.anchorage-staging.com',
        credentials: {
          apiKey: '',
          privateKey: ''
        }
      }
    }

    fs.writeFileSync(configPath, YAML.stringify(defaultConfig))

    config = defaultConfig
  } else {
    const configFile = fs.readFileSync(configPath, 'utf8')
    config = Config.parse(YAML.parse(configFile))
  }
} catch (error) {
  console.error('Error handling config.yaml:', error)
  throw error
}

type KeyPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? K | `${K}.${KeyPath<T[K]>}` : K) : never
    }[keyof T]
  : never

type ValuePath<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? ValuePath<T[K], R>
      : never
    : never

export const setConfig = <P extends KeyPath<Config>>(path: P, value: ValuePath<Config, P>) => {
  const newConfig = cloneDeep(config)
  set(newConfig, path, value)
  const validConfig = Config.parse(newConfig)
  fs.writeFileSync(configPath, YAML.stringify(validConfig))
  config = validConfig
}

export const vaultClient = new VaultClient({
  clientId: config.clientId,
  signer: {
    sign: buildSignerEdDSA(config.narvalAuthPrivateKey),
    jwk: privateKeyToJwk(config.narvalAuthPrivateKey as Hex, 'EDDSA'),
    alg: 'EDDSA'
  },
  host: config.baseUrl
})

export { config }
