import { Entities, EntityUtil, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import {
  Configuration,
  EntityDataStoreDto,
  ManagedDataStoreApiFactory,
  PolicyDataStoreDto,
  SetEntityStoreResponseDto,
  SetPolicyStoreResponseDto
} from '../http/client/auth'
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

  async sign(entities: Partial<Entities>, opts?: SignOptions): Promise<string> {
    return signJwtPayload(this.config, buildJwtPayload(this.config, this.populate(entities), opts))
  }

  async push(store: { data: Partial<Entities>; signature: string }): Promise<SetEntityStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setEntities(this.config.clientId, {
      data: this.populate(store.data),
      signature: store.signature
    })

    return data
  }

  async signAndPush(entities: Partial<Entities>, opts?: SignOptions): Promise<SetEntityStoreResponseDto> {
    const signature = await this.sign(entities, opts)

    return this.push({
      data: entities,
      signature
    })
  }

  async fetch(): Promise<EntityDataStoreDto> {
    const { data } = await this.dataStoreHttp.getEntities(this.config.clientId)

    return data
  }

  private populate(entities: Partial<Entities>): Entities {
    return {
      ...EntityUtil.empty(),
      ...entities
    }
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

  async sign(policies: Policy[], opts?: SignOptions): Promise<string> {
    return signJwtPayload(this.config, buildJwtPayload(this.config, policies, opts))
  }

  async push(store: PolicyStore): Promise<SetPolicyStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setPolicies(this.config.clientId, store)

    return data
  }

  async signAndPush(policies: Policy[], opts?: SignOptions): Promise<SetPolicyStoreResponseDto> {
    const signature = await this.sign(policies, opts)

    return this.push({ data: policies, signature })
  }

  async fetch(): Promise<PolicyDataStoreDto> {
    const { data } = await this.dataStoreHttp.getPolicies(this.config.clientId)

    return data
  }
}
