import { Entities, EntityUtil, Policy } from '@narval/policy-engine-shared'
import axios from 'axios'
import {
  Configuration,
  EntityDataStoreDto,
  ManagedDataStoreApiFactory,
  PolicyDataStoreDto,
  SetEntityStoreResponseDto,
  SetPolicyStoreResponseDto
} from '../http/client/auth'
import { sign } from '../jose/sign'
import { DataStoreConfig, DataStoreHttp, SignOptions } from './type'

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
    return sign({
      data: this.populate(entities),
      clientId: this.config.clientId,
      signer: this.config.signer,
      issuedAt: opts?.issuedAt
    })
  }

  async push(entities: Partial<Entities>, signature: string): Promise<SetEntityStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setEntities(this.config.clientId, {
      data: this.populate(entities),
      signature
    })

    return data
  }

  async signAndPush(entities: Partial<Entities>, opts?: SignOptions): Promise<SetEntityStoreResponseDto> {
    const signature = await this.sign(entities, opts)

    return this.push(entities, signature)
  }

  async get(): Promise<EntityDataStoreDto> {
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
    return sign({
      data: policies,
      clientId: this.config.clientId,
      signer: this.config.signer,
      issuedAt: opts?.issuedAt
    })
  }

  async push(policies: Policy[], signature: string): Promise<SetPolicyStoreResponseDto> {
    const { data } = await this.dataStoreHttp.setPolicies(this.config.clientId, {
      data: policies,
      signature
    })

    return data
  }

  async signAndPush(policies: Policy[], opts?: SignOptions): Promise<SetPolicyStoreResponseDto> {
    const signature = await this.sign(policies, opts)

    return this.push(policies, signature)
  }

  async get(): Promise<PolicyDataStoreDto> {
    const { data } = await this.dataStoreHttp.getPolicies(this.config.clientId)

    return data
  }
}
