import { Alg, Ed25519PrivateKey, generateJwk, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { HttpStatus, Injectable, NotImplementedException } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { BrokerException } from '../exception/broker.exception'
import { InvalidConnectionPrivateKeyException } from '../exception/invalid-connection-private-key.exception'
import { MissingConnectionCredentialsException } from '../exception/missing-connection-credentials.exception'
import { NotFoundException } from '../exception/not-found.exception'
import {
  ActiveConnection,
  Connection,
  ConnectionStatus,
  CreateConnection,
  CreateCredentials,
  InitiateConnection,
  PendingConnection,
  Provider,
  isActiveConnection,
  isPendingConnection,
  isRevokedConnection
} from '../type/connection.type'

@Injectable()
export class ConnectionService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionKeyService: EncryptionKeyService
  ) {}

  async initiate(clientId: string, input: InitiateConnection): Promise<PendingConnection> {
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
      updatedAt: now,
      // TODO: (@wcalderipe, 05/12/24): HMAC hash and signature.
      integrity: 'TODO INITIATE CONNECTION'
    }

    await this.connectionRepository.create(connection)

    return {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      integrity: connection.integrity,
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
  private async getPrivateKey({ provider, credentials }: CreateConnection): Promise<Ed25519PrivateKey> {
    if (!credentials) {
      throw new MissingConnectionCredentialsException()
    }

    if (provider === Provider.ANCHORAGE) {
      if (credentials.privateKey) {
        return privateKeyToJwk(credentials.privateKey, Alg.EDDSA)
      }

      return await generateJwk(Alg.EDDSA)
    }

    throw new NotImplementedException(`Unsupported provider private key getter: ${provider}`)
  }

  // TODO: (@wcalderipe, 05/12/24): The return type is Anchorage specific.
  private async generatePrivateKey(): Promise<Ed25519PrivateKey> {
    return await generateJwk(Alg.EDDSA)
  }

  async create(clientId: string, input: CreateConnection): Promise<ActiveConnection> {
    // If a connection ID is provided, check if the connection already
    // exists. If it does, activate the connection.
    if (input.connectionId) {
      if (await this.connectionRepository.exists(clientId, input.connectionId)) {
        return this.activate(clientId, {
          ...input,
          connectionId: input.connectionId
        })
      }
    }

    if (input.credentials) {
      return this.createActiveConnection(clientId, input)
    }

    if (input.encryptedCredentials) {
      const credentials = await this.buildCreateCredentials(clientId, input)

      return this.createActiveConnection(clientId, { ...input, credentials })
    }

    throw new MissingConnectionCredentialsException()
  }

  private async createActiveConnection(clientId: string, input: CreateConnection): Promise<ActiveConnection> {
    // By this point, the credentials should have already been decrypted
    // and decoded.
    if (!input.credentials) {
      throw new MissingConnectionCredentialsException()
    }

    const now = new Date()
    const privateKey = await this.getPrivateKey(input)

    if (privateKey.kty) {
      const connection = {
        clientId,
        createdAt: now,
        credentials: {
          apiKey: input.credentials.apiKey,
          privateKey,
          publicKey: getPublicKey(privateKey)
        },
        connectionId: input.connectionId || uuid(),
        label: input.label,
        provider: input.provider,
        url: input.url,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: now,
        // TODO: (@wcalderipe, 05/12/24): HMAC hash and signature.
        integrity: 'TODO CREATE CONNECTION'
      }

      await this.connectionRepository.create(connection)

      return connection
    }

    throw new InvalidConnectionPrivateKeyException()
  }

  async activate(clientId: string, input: SetRequired<CreateConnection, 'connectionId'>): Promise<ActiveConnection> {
    const pendingConnection = await this.connectionRepository.findById(clientId, input.connectionId)

    if (isPendingConnection(pendingConnection)) {
      // TODO: Ensure the connection status is pending.
      const now = new Date()

      const credentials = await this.buildCreateCredentials(clientId, input)

      const connection = {
        connectionId: input.connectionId,
        status: ConnectionStatus.ACTIVE,
        label: input.label,
        url: input.url,
        updatedAt: now,
        credentials: {
          ...pendingConnection.credentials,
          apiKey: credentials.apiKey
        },
        // TODO: (@wcalderipe, 05/12/24): HMAC hash and signature.
        integrity: 'TODO ACTIVATE CONNECTION'
      }

      await this.connectionRepository.update(connection)

      return { ...pendingConnection, ...connection }
    }

    throw new BrokerException({
      message: "Cannot activate connection because it's not pending",
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  }

  async exists(clientId: string, connectionId?: string): Promise<boolean> {
    if (connectionId) {
      return this.connectionRepository.exists(clientId, connectionId)
    }

    return false
  }

  private async buildCreateCredentials(clientId: string, input: CreateConnection): Promise<CreateCredentials> {
    if (input.encryptedCredentials) {
      const raw = await this.encryptionKeyService.decrypt(clientId, input.encryptedCredentials)
      const parse = CreateCredentials.safeParse(JSON.parse(raw))

      if (parse.success) {
        return parse.data
      }

      throw new InvalidConnectionPrivateKeyException({
        context: { errors: parse.error.errors }
      })
    }

    if (input.credentials) {
      return input.credentials
    }

    throw new MissingConnectionCredentialsException()
  }

  async findById(clientId: string, connectionId: string): Promise<Connection> {
    return this.connectionRepository.findById(clientId, connectionId)
  }

  async findAll(clientId: string): Promise<Connection[]> {
    return this.connectionRepository.findAll(clientId)
  }

  async revoke(clientId: string, connectionId: string): Promise<boolean> {
    const connection = await this.connectionRepository.findById(clientId, connectionId)

    if (isRevokedConnection(connection)) {
      throw new BrokerException({
        message: 'Connection already revoked',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    if (isActiveConnection(connection) || isPendingConnection(connection)) {
      await this.connectionRepository.update({
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
