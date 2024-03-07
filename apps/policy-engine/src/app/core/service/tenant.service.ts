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

  async save(tenant: Tenant): Promise<Tenant> {
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
      const hasSynced = await this.syncDataStore(tenant.clientId)

      if (!hasSynced) {
        this.logger.warn('Failed to sync tenant data store after save')
      }

      return tenant
    } catch (error) {
      throw new ApplicationException({
        message: 'Failed to save tenant',
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

        const store = await this.dataStoreService.fetch(tenant.dataStore)

        await Promise.all([
          this.tenantRepository.saveEntityStore(clientId, store.entity),
          this.tenantRepository.savePolicyStore(clientId, store.policy)
        ])

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

  async findEntityStore(clientId: string): Promise<EntityStore | null> {
    return this.tenantRepository.findEntityStore(clientId)
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    return this.tenantRepository.findPolicyStore(clientId)
  }
}
