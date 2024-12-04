import { Alg, Ed25519PrivateKey, generateJwk, getPublicKey, hash, privateKeyToJwk } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { Connection, ConnectionStatus, CreateConnection } from '../type/connection.type'

@Injectable()
export class ConnectionService {
  constructor(private readonly connectionRepository: ConnectionRepository) {}

  async create(clientId: string, input: CreateConnection): Promise<Connection> {
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
        id: input.connectionId || uuid(),
        label: input.label,
        provider: input.provider,
        revokedAt: undefined,
        status: ConnectionStatus.ACTIVE,
        updatedAt: now,
        url: input.url
      }

      return this.connectionRepository.save({
        ...connection,
        // TODO: Sign the hash.
        integrity: hash(connection)
      })
    }

    throw new ApplicationException({
      message: 'Invalid private key type',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  }

  // TODO: This is Anchorage specific.
  private async getPrivateKey({ credentials: credential }: CreateConnection): Promise<Ed25519PrivateKey> {
    if (credential.privateKey) {
      return privateKeyToJwk(credential.privateKey, Alg.EDDSA)
    }

    return await generateJwk(Alg.EDDSA)
  }
}
