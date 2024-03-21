import { EncryptionService } from '@narval/encryption-module'
import { FIXTURE } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { TenantService } from './tenant.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private tenantService: TenantService,
    private encryptionService: EncryptionService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start engine bootstrap')

    await this.checkEncryptionConfiguration()

    if (!(await this.tenantService.findByClientId(FIXTURE.ORGANIZATION.id))) {
      await this.tenantService.onboard({
        clientId: FIXTURE.ORGANIZATION.id,
        clientSecret: randomBytes(42).toString('hex'),
        dataStore: {
          entity: {
            dataUrl: 'http://127.0.0.1:3001/storage/2/entity',
            signatureUrl: 'http://127.0.0.1:3001/storage/2/entity',
            keys: []
          },
          policy: {
            dataUrl: 'http://127.0.0.1:3001/storage/2/policy',
            signatureUrl: 'http://127.0.0.1:3001/storage/2/policy',
            keys: []
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await this.syncTenants()
  }

  private async checkEncryptionConfiguration(): Promise<void> {
    this.logger.log('Check encryption configuration')

    try {
      this.encryptionService.getKeyring()
      this.logger.log('Encryption keyring configured')
    } catch (error) {
      this.logger.error(
        'Missing encryption keyring. Please provision the application with "make policy-engine/cli CMD=provision"'
      )

      throw error
    }
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
