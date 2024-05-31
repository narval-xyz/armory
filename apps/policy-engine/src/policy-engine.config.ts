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
  resourcePath: z.string(),
  database: z.object({
    url: z.string().startsWith('postgresql:')
  }),
  engine: z.object({
    id: z.string(),
    adminApiKeyHash: z.string().optional(),
    masterKey: z.string().optional()
  }),
  keyring: z.union([
    z.object({
      type: z.literal('raw'),
      masterPassword: z.string()
    }),
    z.object({
      type: z.literal('awskms'),
      masterAwsKmsArn: z.string()
    })
  ]),
  signingProtocol: z.union([z.literal('simple'), z.literal('mpc')]).default('simple'),
  tsm: z
    .object({
      url: z.string(),
      apiKey: z.string(),
      playerCount: z.coerce.number().default(3)
    })
    .optional()
    .describe('Only required when signingProtocol is mpc. The TSM SDK node config.')
})

export type Config = z.infer<typeof configSchema>

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: process.env.CORS ? process.env.CORS.split(',') : [],
    resourcePath: process.env.RESOURCE_PATH,
    database: {
      url: process.env.APP_DATABASE_URL
    },
    engine: {
      id: process.env.APP_UID,
      adminApiKeyHash: process.env.ADMIN_API_KEY,
      masterKey: process.env.MASTER_KEY
    },
    keyring: {
      type: process.env.KEYRING_TYPE,
      masterAwsKmsArn: process.env.MASTER_AWS_KMS_ARN,
      masterPassword: process.env.MASTER_PASSWORD
    },
    signingProtocol: process.env.SIGNING_PROTOCOL,
    tsm:
      process.env.SIGNING_PROTOCOL === 'mpc'
        ? {
            url: process.env.TSM_URL,
            apiKey: process.env.TSM_API_KEY,
            playerCount: process.env.TSM_PLAYER_COUNT
          }
        : undefined
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}
