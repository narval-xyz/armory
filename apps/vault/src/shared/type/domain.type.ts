import { BIP44_PREFIX, DerivationPath, Origin } from '@narval/armory-sdk'
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
  adminApiKey: z.string().min(1).optional(),
  masterKey: z.string().min(1).optional()
})
export type App = z.infer<typeof App>

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

export const AddressIndex = DerivationPath.transform((data) => {
  const suffix = data.slice(BIP44_PREFIX.length)
  const index = Number(suffix)

  return index
})
export type AddressIndex = z.infer<typeof AddressIndex>

export const RootKey = z.object({
  keyId: z.string().min(1),
  mnemonic: z.string().min(1),
  origin: z.union([z.literal(Origin.GENERATED), z.literal(Origin.IMPORTED)])
})
export type RootKey = z.infer<typeof RootKey>

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
  WALLET: 'wallet',
  MNEMONIC: 'mnemonic',
  IMPORT: 'import',
  BACKUP: 'backup',
  REQUEST_NONCE: 'request-nonce'
} as const
export type Collection = (typeof Collection)[keyof typeof Collection]

export const Algorithm = z.union([z.literal(Alg.ES256K), z.literal(Alg.ES256K)])
export type Algorithm = z.infer<typeof Algorithm>

export const Curve = z.union([z.literal(Curves.P256), z.literal(Curves.SECP256K1)])
export type Curve = z.infer<typeof Curve>
