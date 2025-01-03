import { ConfigService } from '@narval/config-module'
import { LoggerService, PaginatedResult } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { randomUUID } from 'crypto'
import { SetRequired } from 'type-fest'
import { Config, Env } from '../../../main.config'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { ConnectionRepository, FindAllOptions } from '../../persistence/repository/connection.repository'
import { ConnectionActivatedEvent } from '../../shared/event/connection-activated.event'
import { BrokerException } from '../exception/broker.exception'
import { ConnectionInvalidCredentialsException } from '../exception/connection-invalid-credentials.exception'
import { ConnectionInvalidStatusException } from '../exception/connection-invalid-status.exception'
import { NotFoundException } from '../exception/not-found.exception'
import { AnchorageCredentialService } from '../provider/anchorage/anchorage-credential.service'
import { AnchorageCredentials, AnchorageInputCredentials } from '../provider/anchorage/anchorage.type'
import { FireblocksCredentialService } from '../provider/fireblocks/fireblocks-credential.service'
import { FireblocksCredentials, FireblocksInputCredentials } from '../provider/fireblocks/fireblocks.type'
import {
  Connection,
  ConnectionStatus,
  ConnectionWithCredentials,
  CreateConnection,
  InitiateConnection,
  PendingConnection,
  UpdateConnection,
  isActiveConnection,
  isPendingConnection,
  isRevokedConnection
} from '../type/connection.type'
import { Provider, ProviderCredentialService } from '../type/provider.type'

type ProviderInputCredentialsMap = {
  anchorage: AnchorageInputCredentials
  fireblocks: FireblocksInputCredentials
}

type ProviderCredentialsMap = {
  anchorage: AnchorageCredentials
  fireblocks: FireblocksCredentials
}

@Injectable()
export class ConnectionService {
  private readonly providerCredentialServices: {
    [P in Provider]: ProviderCredentialService<ProviderInputCredentialsMap[P], ProviderCredentialsMap[P]>
  }

  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionKeyService: EncryptionKeyService,
    private readonly configService: ConfigService<Config>,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
    // Provider Specific Credential Services
    fireblocksCredentialService: FireblocksCredentialService,
    anchorageCredentialService: AnchorageCredentialService
  ) {
    this.providerCredentialServices = {
      [Provider.ANCHORAGE]: anchorageCredentialService,
      [Provider.FIREBLOCKS]: fireblocksCredentialService
    }
  }

  async initiate(clientId: string, input: InitiateConnection): Promise<PendingConnection> {
    this.logger.log('Initiate pending connection', { clientId })

    const now = new Date()
    const generatedCredentials = await this.generateProviderCredentials(input.provider)
    const encryptionKey = await this.encryptionKeyService.generate(clientId)
    const connection = {
      clientId,
      connectionId: input.connectionId || randomUUID(),
      createdAt: now,
      credentials: generatedCredentials,
      encryptionPublicKey: encryptionKey.publicKey,
      provider: input.provider,
      revokedAt: undefined,
      status: ConnectionStatus.PENDING,
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
      encryptionPublicKey: encryptionKey.publicKey,
      provider: connection.provider,
      status: connection.status,
      updatedAt: connection.updatedAt
    }
  }

  async activate(
    clientId: string,
    input: SetRequired<CreateConnection, 'connectionId'>
  ): Promise<ConnectionWithCredentials> {
    const pendingConnection = await this.connectionRepository.findById(clientId, input.connectionId)
    const existingCredentials = await this.findCredentials(pendingConnection)

    if (!existingCredentials) {
      throw new ConnectionInvalidCredentialsException({
        message: "Cannot activate a connection that's missing credentials",
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    if (isPendingConnection(pendingConnection)) {
      this.logger.log('Activate pending connection', {
        clientId,
        connectionId: pendingConnection.connectionId
      })

      const now = input.createdAt || new Date()
      const provider = pendingConnection.provider
      const inputCredentials = await this.getInputCredentials(provider, clientId, input)
      let connection = {
        ...pendingConnection,
        clientId,
        connectionId: input.connectionId,
        createdAt: pendingConnection.createdAt,
        credentials: existingCredentials,
        label: input.label,
        status: ConnectionStatus.ACTIVE,
        updatedAt: now,
        url: input.url
      }

      // If a private key is provided in the input, it overrides the existing
      // private and public key. Otherwise, adds the API key to the
      // generated credentials.
      if (inputCredentials.privateKey) {
        this.logger.log('Existing private key is being overridden with a new one', {
          clientId,
          connectionId: connection.connectionId
        })

        const updatedCredentials = inputCredentials.privateKey
          ? await this.buildProviderCredentials(provider, inputCredentials)
          : { ...existingCredentials, apiKey: inputCredentials.apiKey }

        connection = {
          ...connection,
          credentials: updatedCredentials
        }
      } else {
        connection = {
          ...connection,
          credentials: {
            ...inputCredentials,
            ...existingCredentials
          }
        }
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

  async create(clientId: string, input: CreateConnection): Promise<ConnectionWithCredentials> {
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

    const now = input.createdAt || new Date()
    const provider = input.provider
    const inputCredentials = await this.getInputCredentials(provider, clientId, input)
    const credentials = await this.buildProviderCredentials(provider, inputCredentials)
    const connection = {
      clientId,
      credentials,
      createdAt: now,
      connectionId: input.connectionId || randomUUID(),
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
        revokedAt: new Date(),
        status: ConnectionStatus.REVOKED
      })

      return true
    }

    throw new NotFoundException({
      message: 'Connection not found',
      context: { clientId, connectionId }
    })
  }

  async update(updateConnection: UpdateConnection): Promise<Connection> {
    const connection = await this.connectionRepository.findById(
      updateConnection.clientId,
      updateConnection.connectionId
    )
    const hasCredentials = updateConnection.credentials || updateConnection.encryptedCredentials
    const update = {
      ...connection,
      // Must include the existing createdAt value for integrity verification.
      createdAt: connection.createdAt,
      ...updateConnection
    }

    if (hasCredentials) {
      const inputCredentials = await this.getInputCredentials(
        connection.provider,
        connection.clientId,
        updateConnection
      )
      const credentials = await this.buildProviderCredentials(connection.provider, inputCredentials)

      await this.connectionRepository.update({
        ...update,
        credentials
      })
    } else {
      await this.connectionRepository.update(update)
    }

    // Strip credentials out of the connection.
    return Connection.parse(update)
  }

  private async getInputCredentials(provider: Provider, clientId: string, input: CreateConnection | UpdateConnection) {
    if (input.encryptedCredentials) {
      const raw = await this.encryptionKeyService.decrypt(clientId, input.encryptedCredentials)
      const json = JSON.parse(raw)

      return this.parseProviderInputCredentials(provider, json)
    }

    if (input.credentials) {
      if (this.configService.get('env') === Env.PRODUCTION) {
        throw new BrokerException({
          message: 'Cannot create connection with plain credentials in production',
          suggestedHttpStatusCode: HttpStatus.FORBIDDEN
        })
      }

      return this.parseProviderInputCredentials(provider, input.credentials)
    }

    throw new ConnectionInvalidCredentialsException()
  }

  async findById(clientId: string, connectionId: string): Promise<Connection> {
    return this.connectionRepository.findById(clientId, connectionId)
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Connection>> {
    return this.connectionRepository.findAll(clientId, options)
  }

  async findAllWithCredentials(
    clientId: string,
    options?: FindAllOptions
  ): Promise<PaginatedResult<ConnectionWithCredentials>> {
    return this.connectionRepository.findAllWithCredentials(clientId, options)
  }

  async findWithCredentialsById(clientId: string, connectionId: string): Promise<ConnectionWithCredentials> {
    return this.connectionRepository.findWithCredentialsById(clientId, connectionId)
  }

  async findCredentials<P extends Provider>(connection: {
    provider: P
    connectionId: string
  }): Promise<ProviderCredentialsMap[P] | null> {
    const json = await this.connectionRepository.findCredentialsJson(connection)

    if (json) {
      try {
        return this.parseProviderCredentials(connection.provider, json)
      } catch (error) {
        throw new ConnectionInvalidCredentialsException({
          message: `Invalid stored ${connection.provider} connection`,
          suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          origin: error
        })
      }
    }

    return null
  }

  parseProviderCredentials<P extends Provider>(provider: P, value: unknown): ProviderCredentialsMap[P] {
    return this.providerCredentialServices[provider].parse(value)
  }

  parseProviderInputCredentials<P extends Provider>(provider: P, value: unknown): ProviderInputCredentialsMap[P] {
    return this.providerCredentialServices[provider].parseInput(value)
  }

  buildProviderCredentials<P extends Provider>(
    provider: P,
    input: ProviderInputCredentialsMap[P]
  ): Promise<ProviderCredentialsMap[P]> {
    return this.providerCredentialServices[provider].build(input)
  }

  generateProviderCredentials<P extends Provider>(provider: P): Promise<ProviderCredentialsMap[P]> {
    return this.providerCredentialServices[provider].generate()
  }
}
