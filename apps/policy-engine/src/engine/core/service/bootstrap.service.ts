import { FIXTURE } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { TenantService } from './tenant.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(private tenantService: TenantService) {}

  async boot(): Promise<void> {
    this.logger.log('Start engine bootstrap')

    if (!(await this.tenantService.findByClientId(FIXTURE.ORGANIZATION.id))) {
      await this.tenantService.onboard({
        clientId: FIXTURE.ORGANIZATION.id,
        clientSecret: randomBytes(42).toString('hex'),
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
      })
    }

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
