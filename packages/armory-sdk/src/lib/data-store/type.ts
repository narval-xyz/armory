import { AxiosPromise, RawAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
  EntityDataStoreDto,
  PolicyDataStoreDto,
  SetEntityStoreDto,
  SetEntityStoreResponseDto,
  SetPolicyStoreDto,
  SetPolicyStoreResponseDto
} from '../http/client/auth'
import { Signer } from '../shared/type'

export const DataStoreConfig = z.object({
  host: z.string(),
  signer: Signer,
  clientId: z.string()
})
export type DataStoreConfig = z.infer<typeof DataStoreConfig>

export type SignOptions = {
  issuedAt?: Date
}

export type DataStoreHttp = {
  /**
   * Gets the client entities.
   *
   * @param {string} clientId
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  getEntities(clientId: string, options?: RawAxiosRequestConfig): AxiosPromise<EntityDataStoreDto>

  /**
   * Gets the client policies.
   *
   * @param {string} clientId
   * @param {RawAxiosRequestConfig} [options] Override http request option.
   * @throws {RequiredError}
   */
  getPolicies(clientId: string, options?: RawAxiosRequestConfig): AxiosPromise<PolicyDataStoreDto>

  /**
   * Sets the client entities.
   *
   * @param {string} clientId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setEntities(
    clientId: string,
    data: SetEntityStoreDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<SetEntityStoreResponseDto>

  /**
   * Sets the client policies.
   *
   * @param {string} clientId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setPolicies(
    clientId: string,
    data: SetPolicyStoreDto,
    options?: RawAxiosRequestConfig
  ): AxiosPromise<SetPolicyStoreResponseDto>
}
