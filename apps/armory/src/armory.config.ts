import { hexSchema } from '@narval/policy-engine-shared'
import { z } from 'zod'

export enum Env {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

const configSchema = z.object({
  env: z.nativeEnum(Env),
  port: z.coerce.number(),
  cors: z.array(z.string()).optional(),
  policyEngine: z.object({
    url: z.string().url(),
    adminApiKey: z.string().optional()
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
  })
})

export type Config = z.infer<typeof configSchema>

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: process.env.CORS ? process.env.CORS.split(',') : [],
    policyEngine: {
      url: process.env.POLICY_ENGINE_URL,
      adminApiKey: process.env.POLICY_ENGINE_ADMIN_API_KEY
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
    }
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid configuration: ${result.error.message}`)
}
