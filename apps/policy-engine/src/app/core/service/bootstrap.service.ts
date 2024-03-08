import { Injectable, Logger } from '@nestjs/common'
import { TenantService } from './tenant.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(private tenantService: TenantService) {}

  async boot(): Promise<void> {
    this.logger.log('Start application bootstrap procedure')

    await this.tenantService.onboard(
      {
        clientId: '012553b0-34e9-4b48-b217-ced3c906cd39',
        clientSecret: 'unsafe-dev-secret',
        dataStore: {
          entity: {
            dataUrl: 'http://127.0.0.1:4200/api/data-store',
            signatureUrl: 'http://127.0.0.1:4200/api/data-store',
            keys: []
          },
          policy: {
            dataUrl: 'http://127.0.0.1:4200/api/data-store',
            signatureUrl: 'http://127.0.0.1:4200/api/data-store',
            keys: []
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Disable sync after the onboard because we'll sync it as part of the boot.
      { syncAfter: true }
    )

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
