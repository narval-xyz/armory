import { z } from 'zod'

export enum Env {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

const ConfigSchema = z.object({
  env: z.nativeEnum(Env),
  port: z.coerce.number(),
  database: z.object({
    url: z.string().startsWith('postgresql:')
  }),
  engineUid: z.string().optional(),
  masterPassword: z.string().optional()
})

export type Config = z.infer<typeof ConfigSchema>

export const load = (): Config => {
  const result = ConfigSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      url: process.env.POLICY_ENGINE_DATABASE_URL
    },
    engineUid: process.env.ENGINE_UID,
    masterPassword: process.env.MASTER_PASSWORD
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}
