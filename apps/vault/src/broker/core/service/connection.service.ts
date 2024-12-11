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
import { SetRequired } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { EncryptionKeyService } from '../../../transit-encryption/core/service/encryption-key.service'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { ConnectionInvalidCredentialsException } from '../exception/connection-invalid-credentials.exception'
import { ConnectionInvalidPrivateKeyException } from '../exception/connection-invalid-private-key.exception'
import { ConnectionInvalidStatusException } from '../exception/connection-invalid-status.exception'
import { NotFoundException } from '../exception/not-found.exception'
import { UpdateException } from '../exception/update.exception'
import {
  ActiveConnection,
  AnchorageCredentials,
  Connection,
  ConnectionStatus,
  CreateConnection,
  CreateCredentials,
  InitiateConnection,
  PendingConnection,
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
  private async generatePrivateKey(): Promise<Ed25519PrivateKey> {
    return await generateJwk(Alg.EDDSA)
  }

  async create(clientId: string, input: CreateConnection): Promise<ActiveConnection> {
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
      return this.createActiveConnection(clientId, input)
    }

    if (input.encryptedCredentials) {
      const credentials = await this.getInputCredentials(clientId, input)

      return this.createActiveConnection(clientId, { ...input, credentials })
    }

    throw new ConnectionInvalidCredentialsException()
  }

  private async createActiveConnection(clientId: string, input: CreateConnection): Promise<ActiveConnection> {
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
        updatedAt: now,
        // TODO: (@wcalderipe, 05/12/24): HMAC hash and signature.
        integrity: 'TODO CREATE CONNECTION'
      }

      await this.connectionRepository.create(connection)

      return connection
    }

    throw new ConnectionInvalidPrivateKeyException()
  }

  async activate(clientId: string, input: SetRequired<CreateConnection, 'connectionId'>): Promise<ActiveConnection> {
    const pendingConnection = await this.connectionRepository.findById(clientId, input.connectionId)

    if (isPendingConnection(pendingConnection)) {
      // TODO: Ensure the connection status is pending.
      const now = new Date()

      const credentials = await this.getInputCredentials(clientId, input)

      const connection = {
        clientId,
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
    const connection = await this.connectionRepository.findById(input.clientId, input.connectionId)
    const hasCredentials = input.credentials || input.encryptedCredentials
    const update = {
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

  async findById(clientId: string, connectionId: string): Promise<Connection> {
    return this.connectionRepository.findById(clientId, connectionId)
  }

  async findAll(clientId: string): Promise<Connection[]> {
    return this.connectionRepository.findAll(clientId)
  }

  async revoke(clientId: string, connectionId: string): Promise<boolean> {
    const connection = await this.connectionRepository.findById(clientId, connectionId)

    if (isRevokedConnection(connection)) {
      throw new ConnectionInvalidStatusException({
        from: connection.status,
        to: ConnectionStatus.REVOKED,
        clientId,
        connectionId
      })
    }

    if (isActiveConnection(connection) || isPendingConnection(connection)) {
      await this.connectionRepository.update({
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
