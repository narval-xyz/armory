import { addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { publicKeySchema, rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const CreateClientInput = z.object({
  clientId: z.string().optional(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  baseUrl: z.string().optional()
})
export type CreateClientInput = z.infer<typeof CreateClientInput>

export const Client = z.object({
  clientId: z.string(),
  engineJwk: publicKeySchema.optional(),

  // JWT verification options.
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),

  // Backup key export options.
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),

  // Override if you want to use a different baseUrl for a single client.
  baseUrl: z.string().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Client = z.infer<typeof Client>

export const App = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1),
  masterKey: z.string().min(1).optional(),
  activated: z.coerce.boolean()
})
export type App = z.infer<typeof App>

const DERIVATION_PATH_PREFIX = "m/44'/60'/"

export const DerivationPath = z.union([
  z.custom<`${typeof DERIVATION_PATH_PREFIX}${string}`>(
    (value) => {
      const result = z.string().startsWith(DERIVATION_PATH_PREFIX).safeParse(value)

      if (result.success) {
        return value
      }

      return false
    },
    {
      message: `Derivation path must start with ${DERIVATION_PATH_PREFIX}`
    }
  ),
  z.literal('next')
])
export type DerivationPath = z.infer<typeof DerivationPath>

export const Origin = {
  IMPORTED: 'IMPORTED',
  GENERATED: 'GENERATED'
} as const
export type Origin = (typeof Origin)[keyof typeof Origin]

export const PrivateWallet = z.object({
  id: z.string().min(1),
  privateKey: hexSchema.refine((val) => val.length === 66, 'Invalid hex privateKey'),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  address: addressSchema,
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)]),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type PrivateWallet = z.infer<typeof PrivateWallet>

export const PublicWallet = z.object({
  id: z.string().min(1),
  address: z.string().min(1),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type PublicWallet = z.infer<typeof PublicWallet>

export const RootKey = z.object({
  keyId: z.string().min(1),
  mnemonic: z.string().min(1),
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)]),
  nextAddrIndex: z.number().min(0).default(0)
})
export type RootKey = z.infer<typeof RootKey>

export const Backup = z.object({
  backupPublicKeyHash: z.string(),
  keyId: z.string(),
  data: z.string(),
  createdAt: z.coerce.date().default(() => new Date())
})
export type Backup = z.infer<typeof Backup>

export const ImportKey = z.object({
  jwk: rsaPrivateKeySchema,
  createdAt: z.number() // epoch in seconds
})
export type ImportKey = z.infer<typeof ImportKey>

export const Collection = {
  CLIENT: 'client',
  APP: 'app',
  WALLET: 'wallet',
  MNEMONIC: 'mnemonic',
  IMPORT: 'import',
  BACKUP: 'backup',
  REQUEST_NONCE: 'request-nonce'
} as const
export type Collection = (typeof Collection)[keyof typeof Collection]
