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
  database: z.object({
    url: z.string().startsWith('postgresql://')
  }),
  redis: z.object({
    host: z.string().min(0),
    port: z.coerce.number()
  }),
  dataFeed: z.object({
    priceFeedPrivateKey: z.string().startsWith('0x'),
    historicalTransferFeedPrivateKey: z.string().startsWith('0x')
  }),
  policyEngine: z.object({
    host: z.string()
  })
})

export type Config = z.infer<typeof configSchema>

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: process.env.CORS ? process.env.CORS.split(',') : [],
    database: {
      url: process.env.ARMORY_DATABASE_URL
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    dataFeed: {
      priceFeedPrivateKey: process.env.PRICE_FEED_PRIVATE_KEY,
      historicalTransferFeedPrivateKey: process.env.HISTORICAL_TRANSFER_FEED_PRIVATE_KEY
    },
    policyEngine: {
      host: process.env.POLICY_ENGINE_HOST
    }
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid configuration: ${result.error.message}`)
}
