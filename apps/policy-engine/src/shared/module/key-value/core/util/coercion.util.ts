/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodArray, ZodObject, z } from 'zod'

type JsonCompatibleSchema = ZodObject<any> | ZodArray<any>

export const encode = <Schema extends JsonCompatibleSchema>(schema: Schema, value: unknown): string => {
  return JSON.stringify(schema.parse(value))
}

export const decode = <Schema extends JsonCompatibleSchema>(schema: Schema, value: string): z.infer<typeof schema> => {
  return schema.parse(JSON.parse(value))
}
