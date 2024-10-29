import { hexSchema } from '@narval/policy-engine-shared'
import { zip } from 'lodash/fp'
import { z } from 'zod'

export enum Env {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

const EnvSchema = z.nativeEnum(Env)

export const isEnv = (env: Env): boolean => EnvSchema.parse(process.env.NODE_ENV) === env

const configSchema = z.object({
  env: z.nativeEnum(Env),
  port: z.coerce.number(),
  cors: z.array(z.string()).optional(),
  app: z.object({
    id: z.string(),
    adminApiKeyHash: z.string().optional().describe('SHA256 hex encoded API key to import on first boot')
  }),
  policyEngine: z.object({
    nodes: z
      .array(
        z.object({
          url: z.string().url(),
          // TODO: (@wcalderipe) Make it required once we have determistic
          // configuration files. The AS is not able to fully operate without
          // PE admin API keys.
          adminApiKey: z.string().optional()
        })
      )
      .min(1)
  }),
  database: z.object({
    url: z.string().startsWith('postgresql://')
  }),
  redis: z.object({
    host: z.string().min(0),
    port: z.coerce.number()
  }),
  dataFeed: z.object({
    priceFeedPrivateKey: hexSchema,
    historicalTransferFeedPrivateKey: hexSchema
  }),
  managedDataStoreBaseUrl: z.string().url()
})

export type Config = z.infer<typeof configSchema>

const toArray = (value?: string): string[] => (value ? value.split(',') : [])

const getPolicyEngineNodes = () => {
  const urls = toArray(process.env.POLICY_ENGINE_URLS)
  const adminApiKeys = toArray(process.env.POLICY_ENGINE_ADMIN_API_KEYS)

  return zip(urls, adminApiKeys).map(([url, adminApiKey]) => ({ url, adminApiKey }))
}

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: toArray(process.env.CORS),
    app: {
      id: process.env.APP_UID,
      adminApiKeyHash: process.env.ADMIN_API_KEY
    },
    policyEngine: {
      nodes: getPolicyEngineNodes()
    },
    database: {
      url: process.env.APP_DATABASE_URL
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    dataFeed: {
      priceFeedPrivateKey: process.env.PRICE_FEED_PRIVATE_KEY,
      historicalTransferFeedPrivateKey: process.env.HISTORICAL_TRANSFER_FEED_PRIVATE_KEY
    },
    managedDataStoreBaseUrl: process.env.MANAGED_DATASTORE_BASE_URL
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid configuration: ${result.error.message}`)
}
