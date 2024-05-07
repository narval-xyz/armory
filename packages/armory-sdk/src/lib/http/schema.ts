import { EvaluationRequest, Request } from '@narval/policy-engine-shared'
import { z } from 'zod'
import { ImportPrivateKeyRequest } from '../domain'

export const BasicHeaders = z.object({
  'x-client-id': z.string(),
  'x-client-secret': z.string()
})
export type BasicHeaders = z.infer<typeof BasicHeaders>

export const SignatureRequestHeaders = z.object({
  'x-client-id': z.string(),
  'detached-jws': z.string(),
  authorization: z.string().startsWith('GNAP ')
})
export type SignatureRequestHeaders = z.infer<typeof SignatureRequestHeaders>

export const SendSignatureRequest = z.object({
  uri: z.string(),
  headers: SignatureRequestHeaders,
  request: Request
})
export type SendSignatureRequest = z.infer<typeof SendSignatureRequest>

export const SendImportPrivateKey = z.object({
  request: ImportPrivateKeyRequest,
  uri: z.string(),
  headers: BasicHeaders
})
export type SendImportPrivateKey = z.infer<typeof SendImportPrivateKey>

export const SendEvaluationRequest = z.object({
  request: EvaluationRequest,
  uri: z.string(),
  headers: BasicHeaders
})
export type SendEvaluationRequest = z.infer<typeof SendEvaluationRequest>
