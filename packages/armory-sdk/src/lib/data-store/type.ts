import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
  EntityDataStoreDto as EntityStoreResponse,
  PolicyDataStoreDto as PolicyStoreResponse,
  SetEntityStoreDto as SetEntityStoreRequest,
  SetEntityStoreResponseDto as SetEntityStoreResponse,
  SetPolicyStoreDto as SetPolicyStoreRequest,
  SetPolicyStoreResponseDto as SetPolicyStoreResponse,
  SyncDto as SyncResponse
} from '../http/client/auth'
import { Signer } from '../shared/type'

export const DataStoreConfig = z.object({
  host: z.string(),
  signer: Signer.optional(),
  clientId: z.string(),
  clientSecret: z.string().optional()
})
export type DataStoreConfig = z.infer<typeof DataStoreConfig>

export type SignOptions = {
  issuedAt?: Date
}

export type {
  EntityStoreResponse,
  PolicyStoreResponse,
  SetEntityStoreRequest,
  SetEntityStoreResponse,
  SetPolicyStoreRequest,
  SetPolicyStoreResponse,
  SyncResponse
}

export type DataStoreHttp = {
  /**
   * Gets the client entities.
   *
   * @param {string} clientId
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  getEntities(clientId: string, options?: RawAxiosRequestConfig): AxiosPromise<EntityStoreResponse>

  /**
   * Gets the client policies.
   *
   * @param {string} clientId
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  getPolicies(clientId: string, options?: RawAxiosRequestConfig): AxiosPromise<PolicyStoreResponse>

  /**
   * Sets the client entities.
   *
   * @param {string} clientId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setEntities(
    clientId: string,
    data: SetEntityStoreRequest,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<SetEntityStoreResponse>

  /**
   * Sets the client policies.
   *
   * @param {string} clientId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setPolicies(
    clientId: string,
    data: SetPolicyStoreRequest,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<SetPolicyStoreResponse>

  /**
   * Syncs the client data stores.
   *
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  sync(clientSecret: string, options?: RawAxiosRequestConfig): AxiosPromise<SyncResponse>
}
