import { Hex, publicKeySchema } from '@narval/signature'
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

export const Wallet = z.object({
  id: z.string().min(1),
  privateKey: z
    .string()
    .regex(/^(0x)?([A-Fa-f0-9]{64})$/)
    .transform((val: string): Hex => val as Hex),
  publicKey: z
    .string()
    .regex(/^(0x)?([A-Fa-f0-9]{130})$/)
    .transform((val: string): Hex => val as Hex),
  address: z
    .string()
    .regex(/^0x([A-Fa-f0-9]{40})$/)
    .transform((val: string): Hex => val as Hex),
  // root seed key id
  keyId: z.string().min(1).optional(),
  // If this is derived from a root seed key, this is the derivation path
  derivationPath: z.string().min(1).optional()
})
export type Wallet = z.infer<typeof Wallet>

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
