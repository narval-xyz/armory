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
    url: z.string().startsWith('postgresql://')
  }),
  redis: z.object({
    host: z.string().min(0),
    port: z.coerce.number()
  })
})

export type Config = z.infer<typeof configSchema>

export const load = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      url: process.env.ORCHESTRATION_DATABASE_URL
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid Orchestration configuration: ${result.error.message}`)
}
