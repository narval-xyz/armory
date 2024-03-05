import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Tenant } from '../../../shared/types/domain.type'
import { TenantRepository } from '../../persistence/repository/tenant.repository'

@Injectable()
export class TenantService {
  constructor(private tenantRepository: TenantRepository) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    return this.tenantRepository.findByClientId(clientId)
  }

  async create(tenant: Tenant): Promise<Tenant> {
    if (await this.tenantRepository.findByClientId(tenant.clientId)) {
      throw new ApplicationException({
        message: 'Tenant already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: tenant.clientId }
      })
    }

    return this.tenantRepository.create(tenant)
  }
}
