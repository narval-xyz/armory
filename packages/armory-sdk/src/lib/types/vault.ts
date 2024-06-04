import { AccessToken, Request, addressSchema, hexSchema } from '@narval/policy-engine-shared'
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

export const ImportPrivateKeyRequest = z.object({
  encryptedPrivateKey: z.string().optional(),
  privateKey: hexSchema.optional(),
  accessToken: AccessToken
})
export type ImportPrivateKeyRequest = z.infer<typeof ImportPrivateKeyRequest>

export const ImportPrivateKeyResponse = z.object({
  id: z.string(),
  address: addressSchema
})
export type ImportPrivateKeyResponse = z.infer<typeof ImportPrivateKeyResponse>

export const GenerateEncryptionKeyRequest = z.object({
  accessToken: AccessToken
})
export type GenerateEncryptionKeyRequest = z.infer<typeof GenerateEncryptionKeyRequest>

export const GenerateEncryptionKeyResponse = z.object({
  publicKey: rsaPublicKeySchema
})
export type GenerateEncryptionKeyResponse = z.infer<typeof GenerateEncryptionKeyResponse>

export const ImportSeedRequest = z.object({
  keyId: z.string().optional(),
  encryptedSeed: z.string(),
  startingIndex: z.number().optional(),
  accessToken: AccessToken
})
export type ImportSeedRequest = z.infer<typeof ImportSeedRequest>

export const PublicWallet = z.object({
  id: z.string().min(1),
  address: z.string().min(1),
  publicKey: hexSchema.refine((val) => val.length === 132, 'Invalid hex publicKey'),
  keyId: z.string().min(1).optional(),
  derivationPath: z.string().min(1).optional()
})
export type PublicWallet = z.infer<typeof PublicWallet>

export const ImportSeedResponse = z.object({
  wallet: PublicWallet,
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
  wallet: PublicWallet,
  backup: z.string().optional(),
  keyId: z.string()
})
export type GenerateKeyResponse = z.infer<typeof GenerateKeyResponse>

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

export const DeriveWalletRequest = z.object({
  keyId: z.string(),
  derivationPaths: z.array(DerivationPath),
  accessToken: AccessToken
})
export type DeriveWalletRequest = z.infer<typeof DeriveWalletRequest>

export const DeriveWalletResponse = z.object({
  wallets: z.union([z.array(PublicWallet), PublicWallet])
})
export type DeriveWalletResponse = z.infer<typeof DeriveWalletResponse>
