import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Tenant } from '../../../shared/type/domain.type'
import { TenantRepository } from '../../persistence/repository/tenant.repository'

@Injectable()
export class TenantService {
  private logger = new Logger(TenantService.name)

  constructor(private tenantRepository: TenantRepository) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    return this.tenantRepository.findByClientId(clientId)
  }

  async onboard(tenant: Tenant): Promise<Tenant> {
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

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findAll()
  }
}
