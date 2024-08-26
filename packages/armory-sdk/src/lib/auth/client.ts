import {
  AccessToken,
  AuthorizationRequest,
  Decision,
  Request,
  SerializedAuthorizationRequest
} from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import assert from 'assert'
import axios from 'axios'
import { reverse } from 'lodash'
import { SetOptional } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { ArmorySdkException } from '../exceptions'
import {
  ApplicationApi,
  AuthorizationApiFactory,
  AuthorizationResponseDto,
  AuthorizationResponseDtoStatusEnum,
  ClientApiFactory,
  Configuration,
  CreateClientRequestDto,
  CreateClientResponseDto,
  PongDto
} from '../http/client/auth'
import { polling } from '../shared/promise'
import { SignOptions } from '../shared/type'
import { AuthorizationResponse } from '../types'
import {
  AuthAdminConfig,
  AuthClientHttp,
  AuthConfig,
  AuthorizationHttp,
  AuthorizationResult,
  Evaluate,
  RequestAccessTokenOptions
} from './type'

export class AuthAdminClient {
  private config: AuthAdminConfig

  private clientHttp: AuthClientHttp

  constructor(config: AuthAdminConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = config
    this.clientHttp = ClientApiFactory(httpConfig, config.host, axiosInstance)
  }

  /**
   * Creates a new client.
   *
   * @param input - The input data for creating the client.
   * @returns A promise that resolves to the created client.
   * @throws {Error} If the admin API key is missing.
   */
  async createClient(input: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    assert(this.config.adminApiKey !== undefined, 'Missing admin API key')

    const { data } = await this.clientHttp.create(this.config.adminApiKey, input)

    return data
  }
}

export class AuthClient {
  private config: AuthConfig

  private authorizationHttp: AuthorizationHttp

  private applicationApi: ApplicationApi

  constructor(config: AuthConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = AuthConfig.parse(config)

    this.authorizationHttp = AuthorizationApiFactory(httpConfig, config.host, axiosInstance)

    this.applicationApi = new ApplicationApi(httpConfig, config.host, axiosInstance)
  }

  async ping(): Promise<PongDto> {
    const { data } = await this.applicationApi.ping()

    return data
  }

  /**
   * Evaluates an authorization request and polls the processed the authorization.
   *
   * @param input - The authorization request input.
   * @param opts - Optional sign options.
   * @returns A promise that resolves to the authorization response.
   */
  async evaluate(input: Evaluate, opts?: SignOptions): Promise<AuthorizationRequest> {
    const parsedRequest = Request.parse(input.request)
    const jwtPayload = this.buildJwtPayload(parsedRequest, opts)
    const authentication = await this.signJwtPayload(jwtPayload)
    const request = SerializedAuthorizationRequest.pick({
      authentication: true,
      request: true,
      metadata: true,
      approvals: true
    }).parse({
      ...input,
      authentication
    })

    const { data } = await this.authorizationHttp.evaluate(this.config.clientId, request)

    return polling<AuthorizationRequest>({
      fn: async () => AuthorizationRequest.parse(await this.getAuthorizationById(data.id)),
      shouldStop: ({ status }) =>
        status !== AuthorizationResponseDtoStatusEnum.Created &&
        status !== AuthorizationResponseDtoStatusEnum.Processing,
      timeoutMs: this.getPollingTimeoutMs(),
      intervalMs: this.getPollingIntervalMs()
    })
  }

  /**
   * Gets an authorization by ID.
   *
   * @param id - The ID of the authorization to retrieve.
   * @returns A Promise that resolves to the retrieved AuthorizationResponseDto.
   */
  async getAuthorizationById(id: string): Promise<AuthorizationResponseDto> {
    const { data } = await this.authorizationHttp.getById(id, this.config.clientId)

    return data
  }

  private buildJwtPayload(request: Request, opts?: SignOptions): Payload {
    return {
      requestHash: hash(request),
      sub: this.config.signer.jwk.kid,
      iss: this.config.clientId,
      iat: opts?.issuedAt?.getTime() || new Date().getTime()
    }
  }

  private signJwtPayload(payload: Payload): Promise<string> {
    const { signer } = this.config

    return signJwt(payload, signer.jwk, { alg: signer.alg }, signer.sign)
  }

  private getPollingTimeoutMs(): number {
    return this.config.pollingTimeoutMs || 10000
  }

  private getPollingIntervalMs(): number {
    return this.config.pollingIntervalMs || 250
  }

  /**
   * Approves an authorization request.
   *
   * @param requestId - The ID of the authorization request to approve.
   * @returns A promise that resolves to the authorization response.
   */
  async approve(requestId: string): Promise<AuthorizationResponseDto> {
    const res = await this.authorizationHttp.getById(requestId, this.config.clientId)
    const { request } = AuthorizationResponse.parse(res.data)
    const signature = await this.signJwtPayload(this.buildJwtPayload(request))
    const { data } = await this.authorizationHttp.approve(requestId, this.config.clientId, { signature })
    return data
  }

  /**
   * Gets an access token by ID.
   * - It fetches the AuthServer for the access token
   * - It returns the last engine signature from the evaluations
   * - It throws an exception if authorization was not permitted
   *
   * This method should be used to fetch a token after the authorization request has been approved.
   * @param requestId
   * @returns
   */
  async getAccessToken(requestId: string): Promise<AccessToken> {
    const res = await this.authorizationHttp.getById(requestId, this.config.clientId)
    const lastSignature = reverse(res.data.evaluations).find((e) => e.signature !== null)?.signature

    if (lastSignature) {
      return { value: lastSignature }
    }

    throw new ArmorySdkException('Unauthorized', { res })
  }

  findApprovalRequirements(authRequest: AuthorizationResponseDto) {
    const requirements = reverse(authRequest.evaluations).find(
      ({ decision }) => decision === Decision.CONFIRM
    )?.approvalRequirements

    return requirements
  }

  /**
   * This method is used to authorize a request.
   * - It ALWAYS creates a new authorization request.
   * - It returns an access token if the decision is PERMIT
   * - It returns a list of approvals if the decision is CONFIRM
   * - It returns a FORBID decision if the decision is FORBID
   *
   * @param request
   * @param opts
   * @returns
   */
  async authorize(
    request: SetOptional<Request, 'nonce'>,
    opts?: RequestAccessTokenOptions
  ): Promise<AuthorizationResult> {
    const authorization = await this.evaluate(
      {
        id: opts?.id || uuid(),
        approvals: opts?.approvals || [],
        request: {
          ...request,
          nonce: request.nonce || uuid()
        }
      },
      opts
    )

    const permit = reverse(authorization.evaluations).find(({ decision }) => decision === Decision.PERMIT)
    const confirm = reverse(authorization.evaluations).find(({ decision }) => decision === Decision.CONFIRM)

    if (permit && permit.signature) {
      return { authId: authorization.id, decision: Decision.PERMIT, accessToken: { value: permit.signature } }
    }

    if (confirm) {
      if (!confirm.approvalRequirements) {
        throw new ArmorySdkException('Missing approval requirements', { authorization })
      }
      return { authId: authorization.id, decision: Decision.CONFIRM, approvals: confirm.approvalRequirements }
    }

    return { authId: authorization.id, decision: Decision.FORBID }
  }

  /**
   *  This method is used to request an access token from the authorization server.
   * - It ALWAYS creates a new authorization request.
   * - It ALWAYS expects a PERMIT decision
   * - It ALWAYS returns an access token
   *
   * @param request
   * @param opts
   * @returns
   */
  async requestAccessToken(
    request: SetOptional<Request, 'nonce'>,
    opts?: RequestAccessTokenOptions
  ): Promise<AccessToken> {
    const authorization = await this.evaluate(
      {
        id: opts?.id || uuid(),
        approvals: opts?.approvals || [],
        request: {
          ...request,
          nonce: request.nonce || uuid()
        }
      },
      opts
    )

    const permit = reverse(authorization.evaluations).find(({ decision }) => decision === Decision.PERMIT)

    if (permit && permit.signature) {
      return { value: permit.signature }
    }

    throw new ArmorySdkException('Unauthorized', { authorization })
  }
}
