/* eslint-disable @typescript-eslint/no-explicit-any */

import { PaginatedResult } from '@narval/nestjs-shared'
import { HttpStatus } from '@nestjs/common'
import { ConnectionWithCredentials } from './connection.type'
import { KnownDestination as KnownDestinationNext } from './known-destination.type'
import { ScopedSyncContext, ScopedSyncResult } from './scoped-sync.type'
import { InternalTransfer, SendTransfer, Transfer } from './transfer.type'

export const Provider = {
  ANCHORAGE: 'anchorage',
  FIREBLOCKS: 'fireblocks',
  BITGO: 'bitgo'
} as const
export type Provider = (typeof Provider)[keyof typeof Provider]

//
// Sync
//

export interface ProviderScopedSyncService {
  scopeSync(context: ScopedSyncContext): Promise<ScopedSyncResult>
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

//
// Known Destination
//

export type ProviderKnownDestinationPaginationOptions = {
  cursor?: string
  limit?: number
}

export interface ProviderKnownDestinationService {
  findAll(
    connection: ConnectionWithCredentials,
    options?: ProviderKnownDestinationPaginationOptions
  ): Promise<PaginatedResult<KnownDestinationNext>>
}
