import { LoggerService, secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration, EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Client } from '../../../shared/type/domain.type'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { DataStoreService } from './data-store.service'
import { SigningService } from './signing.service.interface'

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private dataStoreService: DataStoreService,
    @Inject('SigningService') private signingService: SigningService,
    private logger: LoggerService
  ) {}

  async findById(clientId: string): Promise<Client | null> {
    return this.clientRepository.findById(clientId)
  }

  async create(input: {
    clientId?: string
    clientSecret?: string
    unsafeKeyId?: string
    entityDataStore: DataStoreConfiguration
    policyDataStore: DataStoreConfiguration
    allowSelfSignedData?: boolean
  }): Promise<Client> {
    const now = new Date()
    const { unsafeKeyId, entityDataStore, policyDataStore, allowSelfSignedData } = input
    const clientId = input.clientId || uuid()
    // If we are generating the secret, we'll want to return the full thing to
    // the user one time.
    const fullClientSecret = input.clientSecret || secret.generate()
    const clientSecret = input.clientSecret || secret.hash(fullClientSecret)
    const keyId = unsafeKeyId ? `${clientId}:${unsafeKeyId}` : undefined

    // For MPC, we need a unique sessionId; we'll just generate it from the data
    // since this isn't tx signing so it happens just once
    const sessionId = hash(input)
    const keypair = await this.signingService.generateKey(keyId, sessionId)
    const signer = {
      keyId: keypair.publicKey.kid,
      ...keypair
    }

    // If we are allowing self-signed data, we need to include the engine's key in the data store.
    // This will allow the engine to sign datasets as well, and then it'll have it's own key for verification.
    if (allowSelfSignedData) {
      entityDataStore.keys.push(signer.publicKey)
      policyDataStore.keys.push(signer.publicKey)
    }

    const client = await this.save(
      {
        clientId,
        clientSecret,
        dataStore: {
          entity: entityDataStore,
          policy: policyDataStore
        },
        signer,
        createdAt: now,
        updatedAt: now
      },
      { syncAfter: false } // new clients often won't have data stores configured yet, so require a manual sync after creation.
    )

    return {
      ...client,
      // If we generated a new secret, we need to include it in the response the first time.
      ...(!input.clientSecret ? { clientSecret: fullClientSecret } : {})
    }
  }

  async save(client: Client, options?: { syncAfter?: boolean }): Promise<Client> {
    this.logger.log('Create client', { client, options })

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
      await this.clientRepository.save(client)

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
      this.logger.error('Failed to sync client data store', { error, clientId })

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
