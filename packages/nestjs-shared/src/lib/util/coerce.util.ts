/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodArray, ZodDiscriminatedUnion, ZodObject, ZodUnion, z } from 'zod'

type JsonCompatibleSchema = ZodObject<any> | ZodArray<any> | ZodUnion<any> | ZodDiscriminatedUnion<any, any>

export const encode = <Schema extends JsonCompatibleSchema>(schema: Schema, value: unknown): string => {
  return JSON.stringify(schema.parse(value))
}

export const decode = <Schema extends JsonCompatibleSchema>(schema: Schema, value: string): z.infer<typeof schema> => {
  return schema.parse(JSON.parse(value))
}
