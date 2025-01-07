/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpStatus } from '@nestjs/common'
import { UpdateAccount } from '../../persistence/repository/account.repository'
import { ConnectionWithCredentials } from './connection.type'
import { Account, Address, KnownDestination, UpdateWallet, Wallet } from './indexed-resources.type'
import { InternalTransfer, SendTransfer, Transfer } from './transfer.type'

export const Provider = {
  ANCHORAGE: 'anchorage',
  FIREBLOCKS: 'fireblocks'
} as const
export type Provider = (typeof Provider)[keyof typeof Provider]

//
// Sync
//

export const SyncOperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  FAILED: 'failed',
  SKIP: 'skip'
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

export type SkipSyncOperation = {
  type: typeof SyncOperationType.SKIP
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
  | SkipSyncOperation

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

export const isSkipOperation = <CreateParams, UpdateParams>(
  operation: SyncOperation<CreateParams, UpdateParams>
): operation is SkipSyncOperation => {
  return operation.type === SyncOperationType.SKIP
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
  connection: ConnectionWithCredentials

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
  sync(connection: ConnectionWithCredentials): Promise<SyncResult>

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

//
// Transfer
//

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
  findById(connection: ConnectionWithCredentials, transferId: string): Promise<Transfer>

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
  send(connection: ConnectionWithCredentials, sendTransfer: SendTransfer): Promise<InternalTransfer>
}

//
// Proxy
//

/**
 * Options for making a proxy request, including connection ID, request data,
 * endpoint, and HTTP method.
 */
export type ProxyRequestOptions = {
  connectionId: string
  data?: any
  nonce?: string
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
  forward(connection: ConnectionWithCredentials, options: ProxyRequestOptions): Promise<ProxyResponse>
}

//
// Credential
//

/**
 * Defines methods for managing credentials in various formats. This includes
 * handling credentials used during data operations, typically in JSON Web Key
 * (JWK) format, and credentials in transit, which may be represented as
 * strings of private keys.
 */
export interface ProviderCredentialService<InputCredentials, Credentials> {
  /**
   * Parses a value into the final form of credentials used within the
   * repository or service.
   *
   * @param value - The value to be parsed into credentials.
   * @returns The parsed credentials.
   */
  parse(value: unknown): Credentials

  /**
   * Parses input credentials, ensuring the correct format of string
   * representations for private keys when necessary.
   *
   * @param value - The input value to be parsed into input credentials.
   * @returns The parsed input credentials.
   */
  parseInput(value: unknown): InputCredentials

  /**
   * Builds the final form of credentials from input credentials, validating
   * and converting them from hexadecimal to JSON Web Key (JWK) format.
   *
   * @param input - The input credentials to be converted.
   * @returns A promise that resolves to the final form of credentials.
   */
  build(input: InputCredentials): Promise<Credentials>

  /**
   * Generates signing keys for credential operations.
   *
   * @param options - Provider-specific configuration options for key
   * generation.
   * @returns A promise that resolves to the generated credentials.
   */
  generate<Options extends Record<string, unknown>>(options?: Options): Promise<Credentials>
}
