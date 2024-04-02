/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from 'zod'

export const encode = <Schema extends ZodObject<any>>(schema: Schema, value: unknown): string => {
  return JSON.stringify(schema.parse(value))
}

export const decode = <Schema extends ZodObject<any>>(schema: Schema, value: string): z.infer<typeof schema> => {
  return schema.parse(JSON.parse(value))
}
