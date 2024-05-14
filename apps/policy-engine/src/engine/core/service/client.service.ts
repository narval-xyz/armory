import { secret } from '@narval/nestjs-shared'
import { EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Client } from '../../../shared/type/domain.type'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { DataStoreService } from './data-store.service'

@Injectable()
export class ClientService {
  private logger = new Logger(ClientService.name)

  constructor(
    private clientRepository: ClientRepository,
    private dataStoreService: DataStoreService
  ) {}

  async findById(clientId: string): Promise<Client | null> {
    return this.clientRepository.findById(clientId)
  }

  async save(client: Client, options?: { syncAfter?: boolean }): Promise<Client> {
    const syncAfter = options?.syncAfter ?? true

    const exists = await this.clientRepository.findById(client.clientId)

    if (exists) {
      throw new ApplicationException({
        message: 'Client already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: client.clientId }
      })
    }

    try {
      await this.clientRepository.save({
        ...client,
        clientSecret: secret.hash(client.clientSecret)
      })

      if (syncAfter) {
        const hasSynced = await this.syncDataStore(client.clientId)

        if (!hasSynced) {
          this.logger.warn('Failed to sync new client data store during the onboard')
        }
      }

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

  async syncDataStore(clientId: string): Promise<boolean> {
    this.logger.log('Start syncing client data stores', { clientId })

    try {
      const client = await this.findById(clientId)

      if (client) {
        this.logger.log('Sync client data stores', {
          dataStore: client.dataStore
        })

        const stores = await this.dataStoreService.fetch(client.dataStore)

        await Promise.all([
          this.saveEntityStore(clientId, stores.entity),
          this.savePolicyStore(clientId, stores.policy)
        ])

        this.logger.log('Client data stores synced', { clientId })

        return true
      }

      return false
    } catch (error) {
      this.logger.error('Failed to sync client data store', {
        message: error.message,
        stack: error.stack
      })

      return false
    }
  }

  async saveEntityStore(clientId: string, store: EntityStore): Promise<EntityStore> {
    const result = await this.clientRepository.saveEntityStore(clientId, store)

    if (result) {
      return store
    }

    throw new ApplicationException({
      message: 'Fail to save client entity store',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId }
    })
  }

  async savePolicyStore(clientId: string, store: PolicyStore): Promise<PolicyStore> {
    const result = await this.clientRepository.savePolicyStore(clientId, store)

    if (result) {
      return store
    }

    throw new ApplicationException({
      message: 'Fail to save client policy store',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { clientId }
    })
  }

  async findEntityStore(clientId: string): Promise<EntityStore | null> {
    return this.clientRepository.findEntityStore(clientId)
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    return this.clientRepository.findPolicyStore(clientId)
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.findAll()
  }
}
