import { AccessToken, Request, hexSchema } from '@narval/policy-engine-shared'
import { publicKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const OnboardVaultClientRequest = z.object({
  clientId: z.string().optional(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  baseUrl: z.string().optional()
})
export type OnboardVaultClientRequest = z.infer<typeof OnboardVaultClientRequest>

export const OnboardVaultClientResponse = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  baseUrl: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type OnboardVaultClientResponse = z.infer<typeof OnboardVaultClientResponse>

export const SignatureRequest = z.object({
  request: Request,
  accessToken: AccessToken
})
export type SignatureRequest = z.infer<typeof SignatureRequest>

export const SignatureResponse = z.object({
  signature: hexSchema
})
export type SignatureResponse = z.infer<typeof SignatureResponse>

export const GenerateEncryptionKeyRequest = z.object({
  accessToken: AccessToken
})
export type GenerateEncryptionKeyRequest = z.infer<typeof GenerateEncryptionKeyRequest>

export const GenerateEncryptionKeyResponse = z.object({
  publicKey: rsaPublicKeySchema
})
export type GenerateEncryptionKeyResponse = z.infer<typeof GenerateEncryptionKeyResponse>

export const ImportPrivateKeyRequest = z.object({
  privateKey: hexSchema,
  accessToken: AccessToken
})
export type ImportPrivateKeyRequest = z.infer<typeof ImportPrivateKeyRequest>

export const ImportPrivateKeyResponse = z.object({
  id: z.string(),
  address: z.string()
})
export type ImportPrivateKeyResponse = z.infer<typeof ImportPrivateKeyResponse>

export const ImportSeedRequest = z.object({
  seed: z.string(),
  keyId: z.string().optional(),
  startingIndex: z.number().optional(),
  accessToken: AccessToken
})
export type ImportSeedRequest = z.infer<typeof ImportSeedRequest>

export const PublicAccount = z.object({
  id: z.string().min(1),
  address: z.string().min(1),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type PublicAccount = z.infer<typeof PublicAccount>

export const ImportSeedResponse = z.object({
  account: PublicAccount,
  backup: z.string().optional(),
  keyId: z.string()
})
export type ImportSeedResponse = z.infer<typeof ImportSeedResponse>

export const GenerateKeyRequest = z.object({
  curve: z.string().optional(),
  alg: z.string().optional(),
  keyId: z.string().optional(),
  accessToken: AccessToken
})
export type GenerateKeyRequest = z.infer<typeof GenerateKeyRequest>

export const GenerateKeyResponse = z.object({
  account: PublicAccount,
  backup: z.string().optional(),
  keyId: z.string()
})
export type GenerateKeyResponse = z.infer<typeof GenerateKeyResponse>

export const BIP44_PREFIX = "m/44'/60'/0'/0/"
export const DerivationPath = z.custom<`${typeof BIP44_PREFIX}${number}`>(
  (value) => {
    if (typeof value !== 'string') return false

    if (!value.startsWith(BIP44_PREFIX)) return false

    // Extract the part after the prefix and check if it's a number
    const suffix = value.slice(BIP44_PREFIX.length)
    const isNumber = /^\d+$/.test(suffix)
    return isNumber
  },
  {
    message: `Derivation path must start with ${BIP44_PREFIX} and end with an index`
  }
)
export type DerivationPath = z.infer<typeof DerivationPath>

export const AddressIndex = DerivationPath.transform((data) => {
  const suffix = data.slice(BIP44_PREFIX.length)
  const index = Number(suffix)

  return index
})
export type AddressIndex = z.infer<typeof AddressIndex>

export const DeriveAccountRequest = z.object({
  keyId: z.string(),
  derivationPaths: z.array(DerivationPath).optional(),
  count: z.number().optional(),
  accessToken: AccessToken
})
export type DeriveAccountRequest = z.infer<typeof DeriveAccountRequest>

export const DeriveAccountResponse = z.object({
  accounts: z.array(PublicAccount)
})
export type DeriveAccountResponse = z.infer<typeof DeriveAccountResponse>
