import { AccessToken, Approvals, CreateAuthorizationRequest, Decision } from '@narval/policy-engine-shared'
import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { SetOptional } from 'type-fest'
import { z } from 'zod'
import {
  ApprovalDto,
  AuthorizationRequestDto,
  AuthorizationResponseDto,
  CreateClientResponseDto as CreateAuthClientResponse,
  CreateClientRequestDto
} from '../http/client/auth'
import { SignOptions, Signer } from '../shared/type'

export type { CreateAuthClientResponse }

export const AuthConfig = z.object({
  host: z.string().describe('Authorization Server host URL'),
  signer: Signer.describe('Configuration for the authentication signer'),
  clientId: z.string().describe('The client ID'),
  clientSecret: z.string().optional().describe('The client secret (used for a few operations)'),
  pollingIntervalMs: z
    .number()
    .default(10_000)
    .optional()
    .describe("The polling interval in milliseconds for fetching the authorization request until it's processed"),
  pollingTimeoutMs: z.number().default(250).optional().describe('The polling timeout in milliseconds')
})
export type AuthConfig = z.infer<typeof AuthConfig>

export const AuthAdminConfig = z.object({
  host: z.string().describe('Authorization Server host URL'),
  adminApiKey: z.string().optional().describe('Authorization Server admin API key')
})
export type AuthAdminConfig = z.infer<typeof AuthAdminConfig>

export type AuthorizationHttp = {
  /**
   * Adds an approval to an authorization request.
   *
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  approve(
    id: string,
    clientId: string,
    body: ApprovalDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<AuthorizationResponseDto>

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
  getById(id: string, clientId: string, options?: RawAxiosRequestConfig): AxiosPromise<AuthorizationResponseDto>
}

export type AuthClientHttp = {
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
  ): AxiosPromise<CreateAuthClientResponse>
}

export type RequestAccessTokenOptions = SignOptions &
  SetOptional<Pick<CreateAuthorizationRequest, 'id' | 'approvals'>, 'id' | 'approvals'>

export type Evaluate = Omit<CreateAuthorizationRequest, 'authentication' | 'clientId'>

export type AuthorizationResult =
  | { authId: string; decision: Decision.PERMIT; accessToken: AccessToken }
  | { authId: string; decision: Decision.CONFIRM; approvals: Approvals }
  | { authId: string; decision: Decision.FORBID }
