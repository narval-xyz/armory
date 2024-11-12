import { Entities, EntityStore, EntityUtil, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import assert from 'assert'
import axios, { InternalAxiosRequestConfig } from 'axios'
import { promisify } from 'util'
import * as zlib from 'zlib'
import { Configuration, ManagedDataStoreApiFactory } from '../http/client/auth'
import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET } from '../shared/constant'
import { DataStoreConfig, DataStoreHttp, SetEntityStoreResponse, SetPolicyStoreResponse, SignOptions } from './type'

const gzip = promisify(zlib.gzip)

const buildJwtPayload = (config: DataStoreConfig, data: unknown, opts?: SignOptions): Payload => {
  assert(config.signer !== undefined, 'Missing signer')

  return {
    data: hash(data),
    sub: config.signer.jwk.kid,
    iss: config.clientId,
    iat: opts?.issuedAt?.getTime() || new Date().getTime()
  }
}

const signJwtPayload = (config: DataStoreConfig, payload: Payload): Promise<string> => {
  assert(config.signer !== undefined, 'Missing signer')

  const { signer } = config

  return signJwt(payload, signer.jwk, { alg: signer.alg }, signer.sign)
}

export const compressRequestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  if (config.data && config.method === 'post') {
    const compressed = await gzip(config.data)
    config.data = compressed
    config.headers['Content-Encoding'] = 'gzip'
  }
  return config
}

export const addCompressionInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(compressRequestInterceptor)
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

    addCompressionInterceptor(axiosInstance)

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
  async push(store: { data: Partial<Entities>; signature: string }): Promise<SetEntityStoreResponse> {
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
  async signAndPush(entities: Partial<Entities>, opts?: SignOptions): Promise<SetEntityStoreResponse> {
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
  async fetch(): Promise<EntityStore> {
    assert(this.config.clientSecret !== undefined, 'Missing clientSecret')

    const { data } = await this.dataStoreHttp.getEntities(this.config.clientId, {
      headers: {
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return EntityStore.parse(data.entity)
  }

  /**
   * Syncs the client data stores.
   *
   * @throws {RequiredError}
   */
  async sync(): Promise<boolean> {
    assert(this.config.clientSecret !== undefined, 'Missing clientSecret')

    const { data } = await this.dataStoreHttp.sync(this.config.clientSecret, {
      headers: {
        [REQUEST_HEADER_CLIENT_ID]: this.config.clientId,
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return data.latestSync.success
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

    addCompressionInterceptor(axiosInstance)

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
  async push(store: PolicyStore): Promise<SetPolicyStoreResponse> {
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
  async signAndPush(policies: Policy[], opts?: SignOptions): Promise<SetPolicyStoreResponse> {
    const signature = await this.sign(policies, opts)

    return this.push({ data: policies, signature })
  }

  /**
   * Fetches the latest policies data store.
   *
   * @returns A promise that resolves to the policy data store.
   */
  async fetch(): Promise<PolicyStore> {
    assert(this.config.clientSecret !== undefined, 'Missing clientSecret')

    const { data } = await this.dataStoreHttp.getPolicies(this.config.clientId, {
      headers: {
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return PolicyStore.parse(data.policy)
  }

  /**
   * Syncs the client data stores.
   *
   * @throws {RequiredError}
   */
  async sync(): Promise<boolean> {
    assert(this.config.clientSecret !== undefined, 'Missing clientSecret')

    const { data } = await this.dataStoreHttp.sync(this.config.clientSecret, {
      headers: {
        [REQUEST_HEADER_CLIENT_ID]: this.config.clientId,
        [REQUEST_HEADER_CLIENT_SECRET]: this.config.clientSecret
      }
    })

    return data.latestSync.success
  }
}
