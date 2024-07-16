import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
  AccountDto,
  AccountsDto,
  CreateClientDto,
  ClientDto as CreateVaultClientResponse,
  DeriveAccountDto,
  DeriveAccountResponseDto,
  EncryptionKeyDto,
  GenerateWalletDto,
  ImportPrivateKeyDto,
  ImportWalletDto,
  SignRequestDto,
  SignatureDto,
  WalletDto,
  WalletsDto
} from '../http/client/vault'
import { RequiredError } from '../http/client/vault/base'
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

export type VaultClientHttp = {
  /**
   * Creates a new client
   *
   * @param {string} apiKey
   * @param {CreateClientDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  create(
    apiKey: string,
    data: CreateClientDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<CreateVaultClientResponse>
}

export type EncryptionKeyHttp = {
  /**
   * Generates an encryption key pair used to secure end-to-end
   * communication containing sensitive information.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  generate(clientId: string, accessToken: string, options?: RawAxiosRequestConfig): AxiosPromise<EncryptionKeyDto>
}

export type WalletHttp = {
  /**
   * Generates a new wallet.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {GenerateWalletDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  generate(
    clientId: string,
    accessToken: string,
    data: GenerateWalletDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<WalletDto>

  /**
   * Imports a wallet.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {ImportWalletDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  importSeed(
    clientId: string,
    accessToken: string,
    data: ImportWalletDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<WalletDto>

  /**
   * List the client wallets.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  list(clientId: string, accessToken: string, options?: RawAxiosRequestConfig): AxiosPromise<WalletsDto>
}

export type AccountHttp = {
  /**
   * Add a new account to a wallet
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {DeriveAccountDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  derive(
    clientId: string,
    accessToken: string,
    data: DeriveAccountDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<DeriveAccountResponseDto>

  /**
   * Imports an account
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {ImportPrivateKeyDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  importPrivateKey(
    clientId: string,
    accessToken: string,
    data: ImportPrivateKeyDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<AccountDto>

  /**
   * Lists the client accounts
   *
   * @param {string} clientId
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  list(clientId: string, accessToken: string, options?: RawAxiosRequestConfig): AxiosPromise<AccountsDto>
}

export type SignHttp = {
  /**
   * Signs the given request.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {SignRequestDto} data
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  sign(
    clientId: string,
    accessToken: string,
    data: SignRequestDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<SignatureDto>
}
