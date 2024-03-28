import { EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Tenant } from '../../../shared/type/domain.type'
import { TenantRepository } from '../../persistence/repository/tenant.repository'
import { DataStoreService } from './data-store.service'

@Injectable()
export class TenantService {
  private logger = new Logger(TenantService.name)

  constructor(
    private tenantRepository: TenantRepository,
    private dataStoreService: DataStoreService
  ) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    return this.tenantRepository.findByClientId(clientId)
  }

  async onboard(tenant: Tenant, options?: { syncAfter?: boolean }): Promise<Tenant> {
    const syncAfter = options?.syncAfter ?? true

    const exists = await this.tenantRepository.findByClientId(tenant.clientId)

    if (exists) {
      throw new ApplicationException({
        message: 'Tenant already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: tenant.clientId }
      })
    }

    try {
      await this.tenantRepository.save(tenant)

      if (syncAfter) {
        const hasSynced = await this.syncDataStore(tenant.clientId)

        if (!hasSynced) {
          this.logger.warn('Failed to sync new tenant data store during the onboard')
        }
      }

      return tenant
    } catch (error) {
      throw new ApplicationException({
        message: 'Failed to onboard new tenant',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        origin: error,
        context: { tenant }
      })
    }
  }

  async syncDataStore(clientId: string): Promise<boolean> {
    this.logger.log('Start syncing tenant data stores', { clientId })

    try {
      const tenant = await this.findByClientId(clientId)

      if (tenant) {
        this.logger.log('Sync tenant data stores', {
          dataStore: tenant.dataStore
        })

        const stores = await this.dataStoreService.fetch(tenant.dataStore)

        await Promise.all([
          this.saveEntityStore(clientId, stores.entity),
          this.savePolicyStore(clientId, stores.policy)
        ])

        this.logger.log('Tenant data stores synced', { clientId })

        return true
      }

      return false
    } catch (error) {
      this.logger.error('Failed to sync tenant data store', {
        message: error.message,
        stack: error.stack
      })

      return false
    }
  }

  async saveEntityStore(clientId: string, store: EntityStore): Promise<EntityStore> {
    const result = await this.tenantRepository.saveEntityStore(clientId, store)

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
    const result = await this.tenantRepository.savePolicyStore(clientId, store)

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
    return this.tenantRepository.findEntityStore(clientId)
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    return this.tenantRepository.findPolicyStore(clientId)
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findAll()
  }
}
