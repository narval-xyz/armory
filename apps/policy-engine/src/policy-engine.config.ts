import { z } from 'zod'

export enum Env {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

const configSchema = z.object({
  env: z.nativeEnum(Env),
  port: z.coerce.number(),
  database: z.object({
    url: z.string().startsWith('postgresql:')
  }),
  engine: z.object({
    id: z.string(),
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
    database: {
      url: process.env.POLICY_ENGINE_DATABASE_URL
    },
    engine: {
      id: process.env.ENGINE_UID,
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
