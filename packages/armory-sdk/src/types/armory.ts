// TODO: (@wcalderipe, 19/06/24) Replace all the types here for src/lib/auth
// Ideally, this file shouldn't exist.

import { DataStoreConfiguration, Decision, Request } from '@narval/policy-engine-shared'
import { jwkSchema, publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const PolicyEngineNode = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).describe('plaintext secret for authenticating to this node'),
  publicKey: publicKeySchema,
  url: z.string().url()
})
export type PolicyEngineNode = z.infer<typeof PolicyEngineNode>

export const OnboardArmoryClientRequest = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  useManagedDataStore: z.boolean(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  })
})
export type OnboardArmoryClientRequest = z.infer<typeof OnboardArmoryClientRequest>

export const OnboardArmoryClientResponse = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  clientSecret: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dataStore: z.object({
    entityPublicKey: jwkSchema,
    policyPublicKey: jwkSchema,
    entityDataUrl: z.string(),
    policyDataUrl: z.string()
  }),
  policyEngine: z.object({
    nodes: z.array(PolicyEngineNode)
  })
})
export type OnboardArmoryClientResponse = z.infer<typeof OnboardArmoryClientResponse>

export const AuthorizationRequestStatus = {
  CREATED: 'CREATED',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
  APPROVING: 'APPROVING',
  PERMITTED: 'PERMITTED',
  FORBIDDEN: 'FORBIDDEN'
} as const
export type AuthorizationRequestStatus = (typeof AuthorizationRequestStatus)[keyof typeof AuthorizationRequestStatus]

// TODO: Why is this duplicated?
export const AuthorizationResponse = z.object({
  id: z.string(),
  clientId: z.string(),
  idempotencyKey: z.string().nullable(),
  authentication: z.string(),
  status: z.nativeEnum(AuthorizationRequestStatus),
  evaluations: z.array(
    z.object({
      id: z.string(),
      decision: z.nativeEnum(Decision),
      signature: z.string().nullable().optional()
    })
  ),
  request: Request,
  approvals: z.array(z.string())
})
export type AuthorizationResponse = z.infer<typeof AuthorizationResponse>
