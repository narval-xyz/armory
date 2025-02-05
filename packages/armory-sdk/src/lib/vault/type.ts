import { z } from 'zod'
import { ClientDto as CreateVaultClientResponse } from '../http/client/vault'
import { Signer } from '../shared/type'

export type { CreateVaultClientResponse }

export const VaultAdminConfig = z.object({
  host: z.string().describe('Vault host URL'),
  adminApiKey: z.string().describe('Vault admin API key')
})
export type VaultAdminConfig = z.infer<typeof VaultAdminConfig>

export const VaultConfig = z.object({
  host: z.string().describe('Vault host URL'),
  signer: Signer.describe('Configuration for the authentication signer'),
  clientId: z.string().describe('The client ID')
})
export type VaultConfig = z.infer<typeof VaultConfig>
