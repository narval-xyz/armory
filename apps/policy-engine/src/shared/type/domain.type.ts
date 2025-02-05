import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { privateKeySchema, publicKeySchema, SigningAlg } from '@narval/signature'

import { z } from 'zod'

export const SignerFunction = z.function().args(z.string()).returns(z.promise(z.string()))
export type SignerFunction = z.infer<typeof SignerFunction>

export const SignerConfig = z.object({
  alg: z.nativeEnum(SigningAlg).default(SigningAlg.EIP191), // Temporarily default to EIP191 TODO: remove the default after migration from v1 data
  keyId: z.string().nullable().describe('Unique id of the signer key. Matches the kid in both jwks'),
  publicKey: publicKeySchema.optional(),
  privateKey: privateKeySchema.optional(),
  signer: SignerFunction.optional()
})

export type SignerConfig = z.infer<typeof SignerConfig>

export const Client = z.object({
  clientId: z.string(),
  name: z.string(),
  configurationSource: z.literal('declarative').or(z.literal('dynamic')), // Declarative = comes from config file, Dynamic = created at runtime
  // Override if you want to use a different baseUrl for a single client.
  baseUrl: z.string().nullable(),

  auth: z.object({
    disabled: z.boolean(),
    local: z
      .object({
        clientSecret: z.string().nullable()
      })
      .nullable()
  }),

  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),

  decisionAttestation: z.object({
    disabled: z.boolean(),
    signer: SignerConfig.nullable()
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Client = z.infer<typeof Client>

export const ClientV1 = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),
  signer: SignerConfig,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type ClientV1 = z.infer<typeof ClientV1>

export const PublicClient = z.object({
  clientId: z.string(),
  name: z.string(),
  configurationSource: z.literal('declarative').or(z.literal('dynamic')), // Declarative = comes from config file, Dynamic = created at runtime
  baseUrl: z.string().nullable(),

  auth: z.object({
    disabled: z.boolean(),
    local: z
      .object({
        clientSecret: z.string().nullable()
      })
      .nullable()
  }),

  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),

  decisionAttestation: z.object({
    disabled: z.boolean(),
    signer: z
      .object({
        alg: z.nativeEnum(SigningAlg),
        keyId: z.string().nullable().describe('Unique id of the signer key. Matches the kid in both jwks'),
        publicKey: publicKeySchema.optional()
      })
      .nullable()
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type PublicClient = z.infer<typeof PublicClient>

export const EngineV1 = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1).optional(),
  masterKey: z.string().min(1).optional()
})
export type EngineV1 = z.infer<typeof EngineV1>

export const Engine = z.object({
  id: z.string().min(1),
  adminApiKeyHash: z.string().min(1).nullish(),
  encryptionMasterKey: z.string().min(1).nullish(),
  encryptionKeyringType: z.literal('raw').or(z.literal('awskms')),
  encryptionMasterAwsKmsArn: z.string().nullish(),
  authDisabled: z.boolean().optional()
})
export type Engine = z.infer<typeof Engine>
