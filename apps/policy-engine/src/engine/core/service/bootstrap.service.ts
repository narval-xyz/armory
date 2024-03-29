import { EncryptionService } from '@narval/encryption-module'
import { secp256k1PrivateKeyToJwk } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { generatePrivateKey } from 'viem/accounts'
import { BootstrapException } from '../exception/bootstrap.exception'
import { EngineSignerConfigService } from './engine-signer-config.service'
import { TenantService } from './tenant.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private tenantService: TenantService,
    private encryptionService: EncryptionService,
    private engineSignerConfigService: EngineSignerConfigService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start bootstrap')

    await this.maybeSetupSigningPrivateKey()
    await this.checkEncryptionConfiguration()
    await this.syncTenants()

    this.logger.log('Bootstrap end')
  }

  private async checkEncryptionConfiguration(): Promise<void> {
    this.logger.log('Check encryption configuration')

    try {
      this.encryptionService.getKeyring()
      this.logger.log('Encryption keyring configured')
    } catch (error) {
      throw new BootstrapException('Encryption keyring not found', { origin: error })
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

  private async maybeSetupSigningPrivateKey(): Promise<void> {
    const signerConfig = await this.engineSignerConfigService.getSignerConfig()

    if (signerConfig) {
      return this.logger.log('Skip SECP256K signer set up')
    }

    this.logger.log('Generate and save engine signer private key')

    const result = await this.engineSignerConfigService.save({
      type: 'PRIVATE_KEY',
      key: secp256k1PrivateKeyToJwk(generatePrivateKey())
    })

    if (!result) {
      throw new BootstrapException('Failed to save engine signer configuration')
    }
  }
}
