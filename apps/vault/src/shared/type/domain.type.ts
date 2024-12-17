import { Permission } from '@narval/armory-sdk'
import { addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { Alg, Curves, publicKeySchema, rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const CreateClientInput = z.object({
  clientId: z.string().optional(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  allowWildcard: z.array(z.string()).optional(),
  baseUrl: z.string().optional()
})
export type CreateClientInput = z.infer<typeof CreateClientInput>

export const ClientV1 = z.object({
  clientId: z.string(),
  engineJwk: publicKeySchema.optional(),

  // JWT verification options.
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),

  // Backup key export options.
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),

  // Allow to hash without these paths from the request.
  allowWildcard: z.array(z.string()).optional(),

  // Override if you want to use a different baseUrl for a single client.
  baseUrl: z.string().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type ClientV1 = z.infer<typeof ClientV1>

export const ClientLocalAuthAllowedUser = z.object({
  userId: z.string(),
  publicKey: publicKeySchema
})
export type ClientLocalAuthAllowedUser = z.infer<typeof ClientLocalAuthAllowedUser>

export const Client = z.object({
  clientId: z.string(),
  name: z.string(),
  configurationSource: z.literal('declarative').or(z.literal('dynamic')), // Declarative = comes from config file, Dyanmic = created at runtime
  backupPublicKey: rsaPublicKeySchema.nullable(),
  // Override if you want to use a different baseUrl for a single client.
  baseUrl: z.string().nullable(),

  auth: z.object({
    disabled: z.boolean(),
    local: z
      .object({
        jwsd: z.object({
          maxAge: z.number(),
          requiredComponents: z.array(z.string())
        }),
        allowedUsersJwksUrl: z.string().nullable(),
        allowedUsers: z.array(ClientLocalAuthAllowedUser).nullable()
      })
      .nullable(),
    tokenValidation: z.object({
      disabled: z.boolean(),
      url: z.string().nullable(),
      jwksUrl: z.string().nullable(),
      pinnedPublicKey: publicKeySchema.nullable(),
      verification: z.object({
        audience: z.string().nullable(),
        issuer: z.string().nullable(),
        maxTokenAge: z.number().nullable(),
        requireBoundTokens: z.boolean(),
        allowBearerTokens: z.boolean(),
        allowWildcard: z.array(z.string()).nullable()
      })
    })
  }),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Client = z.infer<typeof Client>

export const AppV1 = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1).optional(),
  masterKey: z.string().min(1).optional()
})
export type AppV1 = z.infer<typeof AppV1>

export const App = z.object({
  id: z.string().min(1),
  adminApiKeyHash: z.string().min(1).nullish(),
  encryptionMasterKey: z.string().min(1).nullish(),
  encryptionKeyringType: z.literal('raw').or(z.literal('awskms')),
  encryptionMasterAwsKmsArn: z.string().nullish(),
  authDisabled: z.boolean().optional()
})
export type App = z.infer<typeof App>

export const Origin = {
  IMPORTED: 'IMPORTED',
  GENERATED: 'GENERATED'
} as const
export type Origin = (typeof Origin)[keyof typeof Origin]

export const PrivateAccount = z.object({
  id: z.string().min(1),
  privateKey: hexSchema.refine((val) => val.length === 66, 'Invalid hex privateKey'),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  address: addressSchema,
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)]),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type PrivateAccount = z.infer<typeof PrivateAccount>

export const PublicAccount = PrivateAccount.omit({ privateKey: true })
export type PublicAccount = z.infer<typeof PublicAccount>

export const LocalRootKey = z.object({
  keyId: z.string().min(1),
  mnemonic: z.string().min(1),
  curve: z.string(),
  keyType: z.literal('local'),
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)])
})
export type LocalRootKey = z.infer<typeof LocalRootKey>

export const RemoteRootKey = z.object({
  keyId: z.string().min(1),
  curve: z.string(),
  keyType: z.literal('remote'),
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)])
})
export type RemoteRootKey = z.infer<typeof RemoteRootKey>

export const RootKey = z.discriminatedUnion('keyType', [LocalRootKey, RemoteRootKey])
export type RootKey = z.infer<typeof RootKey>

export const WalletResponse = z.object({
  keyId: z.string().min(1),
  curve: z.string(),
  keyType: z.union([z.literal('local'), z.literal('remote')]),
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)])
})
export type WalletResponse = z.infer<typeof WalletResponse>

export const Backup = z.object({
  backupPublicKeyHash: z.string(),
  keyId: z.string(),
  data: z.string(),
  createdAt: z.coerce.date().default(() => new Date())
})
export type Backup = z.infer<typeof Backup>

export const DeriveOptions = z.object({
  path: z.string().optional(),
  prefix: z.string().optional(),
  addressIndex: z.number().optional(),
  keyId: z.string().optional()
})
export type DeriveOptions = z.infer<typeof DeriveOptions>

export const ImportKey = z.object({
  jwk: rsaPrivateKeySchema,
  createdAt: z.number() // epoch in seconds
})
export type ImportKey = z.infer<typeof ImportKey>

export const Collection = {
  CLIENT: 'client',
  APP: 'app',
  ACCOUNT: 'account',
  ROOT_KEY: 'root-key',
  IMPORT: 'import',
  BACKUP: 'backup',
  REQUEST_NONCE: 'request-nonce'
} as const
export type Collection = (typeof Collection)[keyof typeof Collection]

export const Algorithm = z.union([z.literal(Alg.ES256K), z.literal(Alg.ES256K)])
export type Algorithm = z.infer<typeof Algorithm>

export const Curve = z.union([z.literal(Curves.P256), z.literal(Curves.SECP256K1)])
export type Curve = z.infer<typeof Curve>

export const VaultPermission = {
  ...Permission,
  CONNECTION_WRITE: 'connection:write',
  CONNECTION_READ: 'connection:read'
} as const
export type VaultPermission = (typeof VaultPermission)[keyof typeof VaultPermission]
