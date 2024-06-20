import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
  ClientDto,
  CreateClientDto,
  GenerateEncryptionKeyResponseDto,
  GenerateKeyDto,
  ImportSeedDto,
  WalletDto,
  WalletsDto
} from '../http/client/vault'
import { Signer } from '../shared/type'

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

export type ClientHttp = {
  /**
   * Creates a new client
   *
   * @param {string} apiKey
   * @param {CreateClientDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  create(apiKey: string, data: CreateClientDto, options?: RawAxiosRequestConfig): AxiosPromise<ClientDto>
}

export type WalletHttp = {
  /**
   * Generates a new wallet.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {GenerateKeyDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  generate(
    clientId: string,
    accessToken: string,
    data: GenerateKeyDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<WalletDto>

  /**
   * Imports a wallet.
   *
   * @param {string} clientId
   * @param {string} accessToken
   * @param {ImportSeedDto} data
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  importKey(
    clientId: string,
    accessToken: string,
    data: ImportSeedDto,
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
  generateEncryptionKey(
    clientId: string,
    accessToken: string,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<GenerateEncryptionKeyResponseDto>
}
