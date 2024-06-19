import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import { ClientDto, CreateClientDto } from '../http/client/vault'

export const VaultAdminConfig = z.object({
  host: z.string().describe('Vault host URL'),
  adminApiKey: z.string().describe('Vault admin API key')
})
export type VaultAdminConfig = z.infer<typeof VaultAdminConfig>

export type ClientHttp = {
  /**
   * Creates a new client
   *
   * @param {string} apiKey
   * @param {CreateClientDto} data
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  create(apiKey: string, data: CreateClientDto, options?: RawAxiosRequestConfig): AxiosPromise<ClientDto>
}
