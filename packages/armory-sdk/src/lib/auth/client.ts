import { Payload, hash, signJwt } from '@narval/signature'
import assert from 'assert'
import axios from 'axios'
import {
  AuthorizationApiFactory,
  AuthorizationRequestDto,
  AuthorizationResponseDto,
  AuthorizationResponseDtoStatusEnum,
  ClientApiFactory,
  Configuration,
  CreateClientRequestDto,
  CreateClientResponseDto
} from '../http/client/auth'
import { polling } from '../shared/promise'
import { SignOptions } from '../shared/type'
import { AuthAdminConfig, AuthConfig, AuthorizationHttp, ClientHttp } from './type'

type AuthorizationRequest = Omit<AuthorizationRequestDto, 'authentication'>

export class AuthAdminClient {
  private config: AuthAdminConfig

  private clientHttp: ClientHttp

  constructor(config: AuthAdminConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = config
    this.clientHttp = ClientApiFactory(httpConfig, config.host, axiosInstance)
  }

  async createClient(input: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    assert(this.config.adminApiKey !== undefined, 'Missing admin API key')

    const { data } = await this.clientHttp.create(this.config.adminApiKey, input)

    return data
  }
}

export class AuthClient {
  private config: AuthConfig

  private authorizationHttp: AuthorizationHttp

  constructor(config: AuthConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = AuthConfig.parse(config)
    this.authorizationHttp = AuthorizationApiFactory(httpConfig, config.host, axiosInstance)
  }

  async evaluate(input: AuthorizationRequest, opts?: SignOptions): Promise<AuthorizationResponseDto> {
    const jwtPayload = this.buildJwtPayload(input, opts)
    const authentication = await this.signJwtPayload(jwtPayload)

    const { data } = await this.authorizationHttp.evaluate(this.config.clientId, {
      ...input,
      authentication
    })

    return polling<AuthorizationResponseDto>({
      fn: () => this.getAuthorizationById(data.id),
      shouldStop: ({ status }) =>
        status !== AuthorizationResponseDtoStatusEnum.Created &&
        status !== AuthorizationResponseDtoStatusEnum.Processing,
      timeoutMs: 10_000,
      intervalMs: 250
    })
  }

  async getAuthorizationById(id: string): Promise<AuthorizationResponseDto> {
    const { data } = await this.authorizationHttp.getById(id)

    return data
  }

  private buildJwtPayload(input: AuthorizationRequest, opts?: SignOptions): Payload {
    return {
      requestHash: hash(input.request),
      sub: this.config.signer.jwk.kid,
      iss: this.config.clientId,
      iat: opts?.issuedAt?.getTime() || new Date().getTime()
    }
  }

  private signJwtPayload(payload: Payload): Promise<string> {
    const { signer } = this.config

    return signJwt(payload, signer.jwk, { alg: signer.alg }, signer.sign)
  }
}
