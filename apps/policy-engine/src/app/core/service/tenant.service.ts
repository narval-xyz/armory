import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Tenant } from '../../../shared/type/domain.type'
import { TenantRepository } from '../../persistence/repository/tenant.repository'
import { DataStoreService } from './data-store.service'

@Injectable()
export class TenantService {
  constructor(
    private tenantRepository: TenantRepository,
    private dataStoreService: DataStoreService
  ) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    return this.tenantRepository.findByClientId(clientId)
  }

  async save(tenant: Tenant): Promise<Tenant> {
    if (await this.tenantRepository.findByClientId(tenant.clientId)) {
      throw new ApplicationException({
        message: 'Tenant already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: tenant.clientId }
      })
    }

    return this.tenantRepository.save(tenant)
  }

  async syncDataStore(clientId: string): Promise<boolean> {
    const tenant = await this.findByClientId(clientId)

    if (tenant) {
      const store = await this.dataStoreService.fetch(tenant.dataStore)

      await Promise.all([
        this.tenantRepository.saveEntityStore(clientId, store.entity),
        this.tenantRepository.savePolicyStore(clientId, store.policy)
      ])

      return true
    }

    return false
  }
}
