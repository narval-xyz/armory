import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
  AuthorizationRequestDto,
  AuthorizationResponseDto,
  CreateClientRequestDto,
  CreateClientResponseDto
} from '../http/client/auth'
import { Signer } from '../shared/type'

export const AuthConfig = z.object({
  host: z.string(),
  signer: Signer,
  clientId: z.string(),
  clientSecret: z.string().optional(),
  pollingInterval: z.number().optional(),
  pollingTimeout: z.number().optional()
})
export type AuthConfig = z.infer<typeof AuthConfig>

export const AuthAdminConfig = z.object({
  host: z.string(),
  adminApiKey: z.string().optional()
})
export type AuthAdminConfig = z.infer<typeof AuthAdminConfig>

export type AuthorizationHttp = {
  /**
   * Submits a new authorization request for evaluation.
   *
   * @param {string} clientId
   * @param {AuthorizationRequestDto} data
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  evaluate(
    clientId: string,
    data: AuthorizationRequestDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<AuthorizationResponseDto>

  /**
   * Gets an authorization request by ID.
   *
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getById(id: string, options?: RawAxiosRequestConfig): AxiosPromise<AuthorizationResponseDto>
}

export type ClientHttp = {
  /**
   * Creates a new client.
   *
   * @param {string} apiKey
   * @param {CreateClientRequestDto} data
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  create(
    apiKey: string,
    data: CreateClientRequestDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<CreateClientResponseDto>
}
