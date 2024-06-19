import { Entities, EntityUtil, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import assert from 'assert'
import axios from 'axios'
import {
  Configuration,
  EntityDataStoreDto,
  ManagedDataStoreApiFactory,
  PolicyDataStoreDto,
  SetEntityStoreResponseDto,
  SetPolicyStoreResponseDto
} from '../http/client/auth'
import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET } from '../shared/constant'
import { DataStoreConfig, DataStoreHttp, SignOptions } from './type'

const buildJwtPayload = (config: DataStoreConfig, data: unknown, opts?: SignOptions): Payload => {
  return {
    data: hash(data),
    sub: config.signer.jwk.kid,
    iss: config.clientId,
    iat: opts?.issuedAt?.getTime() || new Date().getTime()
  }
}

const signJwtPayload = (config: DataStoreConfig, payload: Payload): Promise<string> => {
  const { signer } = config

  return signJwt(payload, signer.jwk, { alg: signer.alg }, signer.sign)
}

export class EntityStoreClient {
  private config: DataStoreConfig

  private dataStoreHttp: DataStoreHttp

  constructor(config: DataStoreConfig) {
    this.config = config

    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.dataStoreHttp = ManagedDataStoreApiFactory(httpConfig, config.host, axiosInstance)
  }

  /**
   * Signs the provided entities and returns a JWT token.
   *
   * @param entities - The entities to sign.
   * @param opts - Optional sign options.
   * @returns A promise that resolves to a JWT token.
   */
  async sign(entities: Partial<Entities>, opts?: SignOptions): Promise<string> {
    return signJwtPayload(this.config, buildJwtPayload(this.config, this.populate(entities), opts))
  }

  private populate(entities: Partial<Entities>): Entities {
    return {
      ...EntityUtil.empty(),
      ...entities
    }
  }

  /**
   * Pushes entities and signature to the data store.
   *
   * @param store - The store object containing the entities data and signature.
   * @returns A promise that resolves to the response.
   */
  async push(store: { data: Partial<Entities>; signature: string }): Promise<SetEntityStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setEntities(this.config.clientId, {
      data: this.populate(store.data),
      signature: store.signature
    })

    return data
  }

  /**
   * Signs the given entities and pushes them to the data store.
   *
   * @param entities - The entities to sign and push.
   * @param opts - Optional sign options.
   * @returns A promise that resolves to the response containing the latest entity store.
   */
  async signAndPush(entities: Partial<Entities>, opts?: SignOptions): Promise<SetEntityStoreResponseDto> {
    const signature = await this.sign(entities, opts)

    return this.push({
      data: entities,
      signature
    })
  }

  /**
   * Fetches the entity data store.
   *
   * @returns A promise that resolves to the entity data store.
   */
  async fetch(): Promise<EntityDataStoreDto> {
    const { data } = await this.dataStoreHttp.getEntities(this.config.clientId)

    return data
  }

  async sync(): Promise<boolean> {
    assert(this.config.clientSecret !== undefined, 'Missing client secret')

    // TODO: BEFORE MERGE, rebase with main and re-generate the client. Fix the return
    await this.dataStoreHttp.sync({
      headers: {
        [REQUEST_HEADER_CLIENT_ID]: this.config.clientId,
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return true
  }
}

export class PolicyStoreClient {
  private config: DataStoreConfig

  private dataStoreHttp: DataStoreHttp

  constructor(config: DataStoreConfig) {
    this.config = config

    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.dataStoreHttp = ManagedDataStoreApiFactory(httpConfig, config.host, axiosInstance)
  }

  /**
   * Signs the provided policies and returns a JWT token.
   *
   * @param entities - The policies to sign.
   * @param opts - Optional sign options.
   * @returns A promise that resolves to a JWT token.
   */
  async sign(policies: Policy[], opts?: SignOptions): Promise<string> {
    return signJwtPayload(this.config, buildJwtPayload(this.config, policies, opts))
  }

  /**
   * Pushes policies and signature to the data store.
   *
   * @param store - The store object containing the policies data and signature.
   * @returns A promise that resolves to the response.
   */
  async push(store: PolicyStore): Promise<SetPolicyStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setPolicies(this.config.clientId, store)

    return data
  }

  /**
   * Signs the given policies and pushes them to the data store.
   *
   * @param entities - The policies to sign and push.
   * @param opts - Optional sign options.
   * @returns A promise that resolves to the response containing the latest policy store.
   */
  async signAndPush(policies: Policy[], opts?: SignOptions): Promise<SetPolicyStoreResponseDto> {
    const signature = await this.sign(policies, opts)

    return this.push({ data: policies, signature })
  }

  /**
   * Fetches the latest policies data store.
   *
   * @returns A promise that resolves to the policy data store.
   */
  async fetch(): Promise<PolicyDataStoreDto> {
    const { data } = await this.dataStoreHttp.getPolicies(this.config.clientId)

    return data
  }

  async sync(): Promise<boolean> {
    assert(this.config.clientSecret !== undefined, 'Missing client secret')

    // TODO: BEFORE MERGE, rebase with main and re-generate the client. Fix the return
    await this.dataStoreHttp.sync({
      headers: {
        [REQUEST_HEADER_CLIENT_ID]: this.config.clientId,
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return true
  }
}
