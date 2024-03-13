import { Injectable, Logger } from '@nestjs/common'
import { TenantService } from './tenant.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(private tenantService: TenantService) {}

  async boot(): Promise<void> {
    this.logger.log('Start engine bootstrap')

    await this.syncTenants()
  }

  private async syncTenants(): Promise<void> {
    const tenants = await this.tenantService.findAll()

    this.logger.log('Start syncing tenants data stores', {
      tenantsCount: tenants.length
    })

    // TODO: (@wcalderipe, 07/03/24) maybe change the execution to parallel?
    for (const tenant of tenants) {
      await this.tenantService.syncDataStore(tenant.clientId)
    }
  }
}
