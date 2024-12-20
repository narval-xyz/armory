import { LoggerService, PaginatedResult } from '@narval/nestjs-shared'
import {
  Alg,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Hex,
  generateJwk,
  getPublicKey,
  privateKeyToJwk
} from '@narval/signature'
import { Injectable, NotImplementedException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SetRequired } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { ConnectionRepository, FindAllOptions } from '../../persistence/repository/connection.repository'
import { ConnectionActivatedEvent } from '../../shared/event/connection-activated.event'
import { ConnectionInvalidCredentialsException } from '../exception/connection-invalid-credentials.exception'
import { ConnectionInvalidPrivateKeyException } from '../exception/connection-invalid-private-key.exception'
import { ConnectionInvalidStatusException } from '../exception/connection-invalid-status.exception'
import { NotFoundException } from '../exception/not-found.exception'
import { UpdateException } from '../exception/update.exception'
import {
  ActiveConnectionWithCredentials,
  AnchorageCredentials,
  Connection,
  ConnectionStatus,
  ConnectionWithCredentials,
  CreateConnection,
  CreateCredentials,
  InitiateConnection,
  PendingConnectionWithCredentials,
  Provider,
  UpdateConnection,
  isActiveConnection,
  isPendingConnection,
  isRevokedConnection
} from '../type/connection.type'

@Injectable()
export class ConnectionService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionKeyService: EncryptionKeyService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async initiate(clientId: string, input: InitiateConnection): Promise<PendingConnectionWithCredentials> {
    this.logger.log('Initiate pending connection', { clientId })

    const now = new Date()
    const privateKey = await this.generatePrivateKey()
    const encryptionKey = await this.encryptionKeyService.generate(clientId)
    const connection = {
      connectionId: input.connectionId || uuid(),
      clientId,
      createdAt: now,
      provider: input.provider,
      credentials: {
        privateKey,
        publicKey: getPublicKey(privateKey)
      },
      encryptionPublicKey: encryptionKey.publicKey,
      status: ConnectionStatus.PENDING,
      revokedAt: undefined,
      updatedAt: now
    }

    await this.connectionRepository.create(connection)

    this.logger.log('Pending connection created', {
      clientId,
      connection: connection.connectionId
    })

    return {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      credentials: {
        privateKey,
        publicKey: connection.credentials.publicKey
      },
      encryptionPublicKey: encryptionKey.publicKey,
      provider: connection.provider,
      status: connection.status
    }
  }

  // TODO: (@wcalderipe, 05/12/24): The return type is Anchorage specific.
  private async generatePrivateKey(): Promise<Ed25519PrivateKey> {
    return await generateJwk(Alg.EDDSA)
  }

  async create(clientId: string, input: CreateConnection): Promise<ActiveConnectionWithCredentials> {
    this.logger.log('Create active connection', { clientId })

    // If a connection ID is provided, check if the connection already exists.
    // If it does, activate the connection.
    if (input.connectionId) {
      if (await this.connectionRepository.exists(clientId, input.connectionId)) {
        return this.activate(clientId, {
          ...input,
          connectionId: input.connectionId
        })
      }
    }

    if (input.credentials) {
      this.logger.log('Create active account from plain credentials', { clientId })

      return this.createActiveConnection(clientId, input)
    }

    if (input.encryptedCredentials) {
      this.logger.log('Create active account from encrypted credentials', { clientId })

      const credentials = await this.getInputCredentials(clientId, input)

      return this.createActiveConnection(clientId, { ...input, credentials })
    }

    throw new ConnectionInvalidCredentialsException()
  }

  private async createActiveConnection(
    clientId: string,
    input: CreateConnection
  ): Promise<ActiveConnectionWithCredentials> {
    // By this point, the credentials should have already been decrypted and
    // decoded.
    if (!input.credentials) {
      throw new ConnectionInvalidCredentialsException()
    }

    const now = new Date()
    const { privateKey, publicKey } = await this.parseInputCredentials(clientId, input.provider, input)

    if (privateKey.kty) {
      const connection = {
        clientId,
        createdAt: now,
        credentials: {
          apiKey: input.credentials.apiKey,
          privateKey,
          publicKey
        },
        connectionId: input.connectionId || uuid(),
        label: input.label,
        provider: input.provider,
        url: input.url,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: now
      }

      await this.connectionRepository.create(connection)

      this.eventEmitter.emit(ConnectionActivatedEvent.EVENT_NAME, new ConnectionActivatedEvent(connection))

      return connection
    }

    throw new ConnectionInvalidPrivateKeyException()
  }

  async activate(
    clientId: string,
    input: SetRequired<CreateConnection, 'connectionId'>
  ): Promise<ActiveConnectionWithCredentials> {
    const pendingConnection = await this.connectionRepository.findById(clientId, input.connectionId, true)

    if (isPendingConnection(pendingConnection) && pendingConnection.credentials) {
      this.logger.log('Activate pending connection', {
        clientId,
        connectionId: pendingConnection.connectionId
      })

      const now = new Date()

      const credentials = await this.getInputCredentials(clientId, input)

      const mergedCredentials = {
        ...pendingConnection.credentials,
        apiKey: credentials.apiKey
      }

      // If a private key is provided in the input, it overrides the private and public key from the pending connection.
      if (credentials.privateKey) {
        mergedCredentials.privateKey = privateKeyToJwk(credentials.privateKey, Alg.EDDSA)
        mergedCredentials.publicKey = getPublicKey(mergedCredentials.privateKey)
      }

      const connection: ActiveConnectionWithCredentials = {
        ...pendingConnection,
        clientId,
        connectionId: input.connectionId,
        status: ConnectionStatus.ACTIVE,
        label: input.label,
        url: input.url,
        updatedAt: now,
        createdAt: pendingConnection.createdAt,
        credentials: mergedCredentials
      }
      await this.connectionRepository.update(connection)
      this.eventEmitter.emit(ConnectionActivatedEvent.EVENT_NAME, new ConnectionActivatedEvent(connection))

      return connection
    }

    this.logger.log("Skip pending connection activation because status it's not pending or missing credentials", {
      clientId,
      connectionId: pendingConnection.connectionId,
      status: pendingConnection.status
    })

    throw new ConnectionInvalidStatusException({
      from: pendingConnection.status,
      to: ConnectionStatus.ACTIVE,
      clientId,
      connectionId: input.connectionId
    })
  }

  // TODO: (@wcalderipe, 05/12/24): The return type is Anchorage specific.
  private async parseInputCredentials(
    clientId: string,
    provider: Provider,
    input: CreateConnection | UpdateConnection
  ): Promise<AnchorageCredentials> {
    // During the creation process, the input credentials can be one of the
    // following:
    // - A plain credential object containing an API key and a private key in
    //   hex format.
    // - Encrypted credentials, which are an RSA-encrypted JSON representation
    //   of the plain credentials.
    //
    // Steps to handle the credentials:
    // - Extract the credentials from the input data.
    // - Ensure that either `credentials` or `encryptedCredentials` is
    //   provided.
    // - If the credentials are encrypted, decrypt and parse the JSON.
    // - Validate the credentials against the expected schema.

    if (provider === Provider.ANCHORAGE) {
      if (input.encryptedCredentials) {
        const raw = await this.encryptionKeyService.decrypt(clientId, input.encryptedCredentials)

        const parse = CreateCredentials.safeParse(JSON.parse(raw))

        if (parse.success) {
          const { privateKey, publicKey } = this.privateKeyHexToKeyPair(Alg.EDDSA, parse.data.privateKey)

          return {
            apiKey: parse.data.apiKey,
            privateKey: privateKey as Ed25519PrivateKey,
            publicKey: publicKey as Ed25519PublicKey
          }
        }

        throw new ConnectionInvalidPrivateKeyException({
          message: 'Invalid input private key schema',
          context: { errors: parse.error.errors }
        })
      }

      if (input.credentials) {
        const { privateKey, publicKey } = this.privateKeyHexToKeyPair(Alg.EDDSA, input.credentials.privateKey)

        return {
          apiKey: input.credentials.apiKey,
          privateKey: privateKey as Ed25519PrivateKey,
          publicKey: publicKey as Ed25519PublicKey
        }
      }

      throw new ConnectionInvalidCredentialsException({
        message: 'Missing input credentials or encryptedCredentials'
      })
    }

    throw new NotImplementedException(`Unsupported provider private key getter: ${provider}`)
  }

  private privateKeyHexToKeyPair(alg: Alg, privateKeyHex?: Hex) {
    if (privateKeyHex) {
      const privateKey = privateKeyToJwk(privateKeyHex, alg)

      return {
        privateKey: privateKey,
        publicKey: getPublicKey(privateKey)
      }
    }

    throw new ConnectionInvalidPrivateKeyException({
      message: 'Invalid private key hex'
    })
  }

  async update(input: UpdateConnection): Promise<Connection> {
    const connection = await this.connectionRepository.findById(input.clientId, input.connectionId, true)
    const hasCredentials = input.credentials || input.encryptedCredentials
    const update = {
      ...connection,
      createdAt: connection.createdAt, // must include the existing createdAt value for integrity verification
      ...input,
      ...(hasCredentials
        ? { credentials: await this.parseInputCredentials(input.clientId, connection.provider, input) }
        : {})
    }

    const isUpdated = await this.connectionRepository.update(update)

    if (isUpdated) {
      return Connection.parse({
        ...connection,
        ...update
      })
    }

    throw new UpdateException({
      context: {
        model: 'Connection',
        connectionId: input.connectionId,
        clientId: input.clientId
      }
    })
  }

  private async getInputCredentials(
    clientId: string,
    input: CreateConnection | UpdateConnection
  ): Promise<CreateCredentials> {
    if (input.encryptedCredentials) {
      const raw = await this.encryptionKeyService.decrypt(clientId, input.encryptedCredentials)
      const parse = CreateCredentials.safeParse(JSON.parse(raw))

      if (parse.success) {
        return parse.data
      }

      throw new ConnectionInvalidPrivateKeyException({
        context: { errors: parse.error.errors }
      })
    }

    if (input.credentials) {
      return input.credentials
    }

    throw new ConnectionInvalidCredentialsException()
  }

  async exists(clientId: string, connectionId?: string): Promise<boolean> {
    if (connectionId) {
      return this.connectionRepository.exists(clientId, connectionId)
    }

    return false
  }

  async findById<T extends boolean = false>(
    clientId: string,
    connectionId: string,
    includeCredentials?: T
  ): Promise<T extends true ? ConnectionWithCredentials : Connection> {
    return this.connectionRepository.findById(clientId, connectionId, includeCredentials)
  }

  async findAll<T extends boolean = false>(
    clientId: string,
    options?: FindAllOptions,
    includeCredentials?: T
  ): Promise<T extends true ? PaginatedResult<ConnectionWithCredentials> : PaginatedResult<Connection>> {
    return this.connectionRepository.findAll(clientId, options, includeCredentials)
  }

  async revoke(clientId: string, connectionId: string): Promise<boolean> {
    const connection = await this.connectionRepository.findById(clientId, connectionId)

    if (isRevokedConnection(connection)) {
      this.logger.log("Skip connection revoke because it's already revoked", {
        clientId,
        connectionId: connection.connectionId
      })

      throw new ConnectionInvalidStatusException({
        from: connection.status,
        to: ConnectionStatus.REVOKED,
        clientId,
        connectionId
      })
    }

    if (isActiveConnection(connection) || isPendingConnection(connection)) {
      this.logger.log('Revoke active or pending connection', {
        clientId,
        connectionId: connection.connectionId
      })

      await this.connectionRepository.update({
        ...connection,
        clientId,
        connectionId: connectionId,
        credentials: null,
        status: ConnectionStatus.REVOKED,
        revokedAt: new Date()
      })

      return true
    }

    throw new NotFoundException({ context: { clientId, connectionId } })
  }
}
