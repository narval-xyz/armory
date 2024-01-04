import { z } from 'zod'

const ConfigSchema = z.object({
  port: z.coerce.number(),
  database: z.object({
    url: z.string().startsWith('postgresql://')
  })
})

export type Config = z.infer<typeof ConfigSchema>

export const load = (): Config => {
  const result = ConfigSchema.safeParse({
    port: process.env.PORT,
    database: {
      url: process.env.ORCHESTRATION_DATABASE_URL
    }
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}
