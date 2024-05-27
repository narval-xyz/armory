import { addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const Client = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  engineJwk: publicKeySchema.optional(),

  // JWT verification options.
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),

  // Backup key export options.
  backupPublicKey: publicKeySchema.optional(),
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

const DerivationPathStart = z.string().startsWith(`m/44'/60'/`)
type DerivationPathStart = `m/44'/60'/${string}`

export const DerivationPath = z.union([
  z.literal('next'),
  DerivationPathStart.refine((val): val is DerivationPathStart => val.startsWith(`m/44'/60'/`), {
    message: "Derivation path must start with m/44'/60'/"
  })
])
export type DerivationPath = z.infer<typeof DerivationPath>

export const Wallet = z.object({
  id: z.string().min(1),
  privateKey: hexSchema.refine((val) => val.length === 66, 'Invalid hex privateKey'),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  address: addressSchema,
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type Wallet = z.infer<typeof Wallet>

export const UserFacingWallet = z.object({
  resourceId: z.string().min(1),
  address: z.string().min(1),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type UserFacingWallet = z.infer<typeof UserFacingWallet>

export const SeedOrigin = {
  IMPORTED: 'imported',
  GENERATED: 'generated'
} as const
export type SeedOrigin = (typeof SeedOrigin)[keyof typeof SeedOrigin]

export const RootKey = z.object({
  keyId: z.string().min(1),
  mnemonic: z.string().min(1),
  origin: z.union([z.literal('imported'), z.literal('generated')]),
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
