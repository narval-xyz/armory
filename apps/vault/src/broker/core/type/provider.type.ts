/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpStatus } from '@nestjs/common'
import { UpdateAccount } from '../../persistence/repository/account.repository'
import { ActiveConnectionWithCredentials } from './connection.type'
import { Account, Address, KnownDestination, UpdateWallet, Wallet } from './indexed-resources.type'
import { InternalTransfer, SendTransfer, Transfer } from './transfer.type'

export const SyncOperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  FAILED: 'failed'
} as const
export type SyncOperationType = (typeof SyncOperationType)[keyof typeof SyncOperationType]

export type CreateSyncOperation<CreateParams> = {
  type: typeof SyncOperationType.CREATE
  create: CreateParams
}

export type UpdateSyncOperation<UpdateParams> = {
  type: typeof SyncOperationType.UPDATE
  update: UpdateParams
}

export type DeleteSyncOperation = {
  type: typeof SyncOperationType.DELETE
  entityId: string
}

export type FailedSyncOperation = {
  type: typeof SyncOperationType.FAILED
  externalId: string
  message: string
  context?: unknown
}

/**
 * Represents a synchronization operation for a resource, which can be a
 * creation, update, or deletion. Each operation type is associated with
 * specific parameters.
 *
 * @template CreateParams - The parameters required for creating an entity.
 * @template UpdateParams - The parameters required for updating an entity.
 */
export type SyncOperation<CreateParams, UpdateParams> =
  | CreateSyncOperation<CreateParams>
  | UpdateSyncOperation<UpdateParams>
  | DeleteSyncOperation
  | FailedSyncOperation

export const isCreateOperation = <CreateParams, UpdateParams>(
  operation: SyncOperation<CreateParams, UpdateParams>
): operation is CreateSyncOperation<CreateParams> => {
  return operation.type === SyncOperationType.CREATE
}

export const isUpdateOperation = <CreateParams, UpdateParams>(
  operation: SyncOperation<CreateParams, UpdateParams>
): operation is UpdateSyncOperation<UpdateParams> => {
  return operation.type === SyncOperationType.UPDATE
}

export const isDeleteOperation = <CreateParams, UpdateParams>(
  operation: SyncOperation<CreateParams, UpdateParams>
): operation is DeleteSyncOperation => {
  return operation.type === SyncOperationType.DELETE
}

export const isFailedOperation = <CreateParams, UpdateParams>(
  operation: SyncOperation<CreateParams, UpdateParams>
): operation is FailedSyncOperation => {
  return operation.type === SyncOperationType.FAILED
}

/**
 * Represents the context used during synchronization, containing the active
 * connection and maps of synchronization operations for various resource
 * types.
 */
export type SyncContext = {
  /**
   * The active connection with credentials used for synchronization.
   */
  connection: ActiveConnectionWithCredentials

  /**
   * A map of wallet synchronization operations, keyed by wallet external ID.
   */
  wallets: SyncOperation<Wallet, UpdateWallet>[]

  /**
   * A map of account synchronization operations, keyed by account external ID.
   */
  accounts: SyncOperation<Account, any>[]

  /**
   * A map of address synchronization operations, keyed by address external ID.
   */
  addresses: SyncOperation<Address, any>[]

  /**
   * A map of known destination synchronization operations, keyed by
   * destination external ID.
   */
  knownDestinations: SyncOperation<KnownDestination, KnownDestination>[]

  /**
   * An optional timestamp used for setting the `createdAt` and `updatedAt`
   * fields during synchronization operations.
   */
  now?: Date
}

export type SyncResult = {
  wallets: SyncOperation<Wallet, any>[]
  accounts: SyncOperation<Account, UpdateAccount>[]
  addresses: SyncOperation<Address, any>[]
  knownDestinations: SyncOperation<KnownDestination, KnownDestination>[]
}

export interface ProviderSyncService {
  /**
   * The main entry point for synchronization, responsible for coordinating the
   * synchronization process across different resources. It orchestrates the
   * sync calls and passes the context between them.
   *
   * IMPORTANT: The synchronization **does not perform the writes** into the
   * database.
   *
   * @param connection - The active connection with credentials required for
   * synchronization.
   *
   * @returns A promise that resolves to an object containing the results of
   * the sync operations for wallets, accounts, addresses, and known
   * destinations.
   */
  sync(connection: ActiveConnectionWithCredentials): Promise<SyncResult>

  /**
   * Synchronizes wallet data within the provided context and returns an
   * updated context.
   *
   * @param context - The current synchronization context containing existing
   * data and operations.
   *
   * @returns A promise that resolves to the updated synchronization context.
   */
  syncWallets(context: SyncContext): Promise<SyncContext>

  /**
   * Synchronizes account data within the provided context and returns an
   * updated context.
   *
   * @param context - The current synchronization context containing existing
   * data and operations.
   *
   * @returns A promise that resolves to the updated synchronization context.
   */
  syncAccounts(context: SyncContext): Promise<SyncContext>

  /**
   * Synchronizes address data within the provided context and returns an
   * updated context.
   *
   * @param context - The current synchronization context containing existing
   * data and operations.
   *
   * @returns A promise that resolves to the updated synchronization context.
   */
  syncAddresses(context: SyncContext): Promise<SyncContext>

  /**
   * Synchronizes known destination data within the provided context and
   * returns an updated context.
   *
   * @param context - The current synchronization context containing existing
   * data and operations.
   *
   * @returns A promise that resolves to the updated synchronization context.
   */
  syncKnownDestinations(context: SyncContext): Promise<SyncContext>
}

export interface ProviderTransferService {
  /**
   * Finds a transfer by its ID.
   *
   * @param connection - The active connection with credentials required for
   * accessing the transfer data.
   * @param transferId - The unique identifier of the transfer to be retrieved.
   *
   * @returns A promise that resolves to the transfer object if found.
   */
  findById(connection: ActiveConnectionWithCredentials, transferId: string): Promise<Transfer>

  /**
   * Sends a transfer using the provided active connection and transfer
   * details.
   *
   * @param connection - The active connection with credentials required for
   * sending the transfer.
   * @param sendTransfer - The details of the transfer to be sent.
   *
   * @returns A promise that resolves to the internal transfer object after the
   * transfer is successfully sent.
   */
  send(connection: ActiveConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer>
}

/**
 * Options for making a proxy request, including connection ID, request data,
 * endpoint, and HTTP method.
 */
export type ProxyRequestOptions = {
  connectionId: string
  data?: any
  endpoint: string
  method: string
}

/**
 * Represents the response from a proxy request, including the response data,
 * HTTP status code, and headers.
 */
export type ProxyResponse = {
  data: any
  code: HttpStatus
  headers: Record<string, any>
}

export interface ProviderProxyService {
  /**
   * Forwards a request to a specified endpoint using the provided active
   * connection and request options.
   *
   * @param connection - The active connection with credentials required for
   * forwarding the request.
   * @param options - The options for the proxy request, including connection
   * ID, request data, endpoint, and HTTP method.
   *
   * @returns A promise that resolves to the proxy response, containing the
   * response data, HTTP status code, and headers.
   */
  forward(connection: ActiveConnectionWithCredentials, options: ProxyRequestOptions): Promise<ProxyResponse>
}
