import { z } from 'zod'

const ConfigSchema = z.object({
  port: z.coerce.number()
})

export type Config = z.infer<typeof ConfigSchema>

export const load = (): Config => {
  const result = ConfigSchema.safeParse({
    port: process.env.PORT
  })

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}
