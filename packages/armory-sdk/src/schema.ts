import { z } from 'zod'
import { DETACHED_JWS, HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from './constants'

export const BasicHeaders = z.object({
  [HEADER_CLIENT_ID]: z.string(),
  [HEADER_CLIENT_SECRET]: z.string().optional()
})
export type BasicHeaders = z.infer<typeof BasicHeaders>

export const GnapHeaders = z.object({
  [HEADER_CLIENT_ID]: z.string(),
  [DETACHED_JWS]: z.string(),
  authorization: z.string().startsWith('GNAP ')
})
export type GnapHeaders = z.infer<typeof GnapHeaders>
