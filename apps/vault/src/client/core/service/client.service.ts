import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { isDeepStrictEqual } from 'util'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Client } from '../../../shared/type/domain.type'
import { ClientRepository } from '../../persistence/repository/client.repository'

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private logger: LoggerService
  ) {}

  // Temporary function to migrate data from V1 to V2
  async migrateV1Data(): Promise<void> {
    const clientsV1 = await this.clientRepository.findAllV1()
    for (const clientV1 of clientsV1) {
      const client: Client = {
        clientId: clientV1.clientId,
        name: clientV1.clientId,
        configurationSource: 'dynamic',
        backupPublicKey: clientV1.backupPublicKey || null,
        baseUrl: clientV1.baseUrl || null,
        auth: {
          disabled: false,
          local: {
            jwsd: {
              maxAge: 60, // 1 minute; this is seconds
              requiredComponents: ['htm', 'uri', 'created', 'ath']
            },
            allowedUsersJwksUrl: null,
            allowedUsers: null
          },
          tokenValidation: {
            disabled: false,
            url: null,
            jwksUrl: null,
            pinnedPublicKey: clientV1.engineJwk || null,
            verification: {
              audience: clientV1.audience || null,
              issuer: clientV1.issuer || null,
              maxTokenAge: clientV1.maxTokenAge || null,
              requireBoundTokens: true,
              allowBearerTokens: false,
              allowWildcard: [
                'transactionRequest.maxPriorityFeePerGas',
                'transactionRequest.maxFeePerGas',
                'transactionRequest.gas',
                'transactionRequest.gasPrice',
                'transactionRequest.nonce'
              ]
            }
          }
        },
        createdAt: clientV1.createdAt,
        updatedAt: clientV1.updatedAt
      }
      this.logger.info('Migrating client', { clientV1, client })
      await this.clientRepository.save(client)
      await this.clientRepository.deleteV1(clientV1.clientId)
    }
  }

  async findById(clientId: string): Promise<Client | null> {
    return this.clientRepository.findById(clientId)
  }

  async save(client: Client, overwriteAllowedUsers = false): Promise<Client> {
    const exists = await this.clientRepository.findById(client.clientId)

    if (exists && exists.configurationSource === 'dynamic') {
      throw new ApplicationException({
        message: 'client already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: client.clientId }
      })
    }

    // Validate the backupPublicKey is not being changed; it can be unset but not rotated here.
    if (
      exists &&
      exists.backupPublicKey &&
      client.backupPublicKey &&
      !isDeepStrictEqual(exists.backupPublicKey, client.backupPublicKey)
    ) {
      throw new ApplicationException({
        message: 'Cannot change backupPublicKey',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: client.clientId }
      })
    }

    try {
      await this.clientRepository.save(client, overwriteAllowedUsers)

      return client
    } catch (error) {
      throw new ApplicationException({
        message: 'Failed to onboard new client',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        origin: error,
        context: { client }
      })
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.findAll()
  }
}
