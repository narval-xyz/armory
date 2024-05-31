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
  baseUrl: z.string().optional(),
  database: z.object({
    url: z.string().startsWith('postgresql:')
  }),
  app: z.object({
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
  ])
})

export type Config = z.infer<typeof configSchema>

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: process.env.CORS ? process.env.CORS.split(',') : [],
    // Such as "https://vault.narval.xyz"
    baseUrl: process.env.BASE_URL,
    database: {
      url: process.env.APP_DATABASE_URL
    },
    app: {
      id: process.env.APP_UID,
      adminApiKeyHash: process.env.ADMIN_API_KEY,
      masterKey: process.env.MASTER_KEY
    },
    keyring: {
      type: process.env.KEYRING_TYPE,
      masterAwsKmsArn: process.env.MASTER_AWS_KMS_ARN,
      masterPassword: process.env.MASTER_PASSWORD
    }
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}
