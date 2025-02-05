import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AppRepository } from './app.repository'
import { Config } from './main.config'
import { App } from './shared/type/domain.type'
import { AppNotProvisionedException } from './vault/core/exception/app-not-provisioned.exception'
import { ProvisionException } from './vault/core/exception/provision.exception'

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<Config>,
    private appRepository: AppRepository,
    private logger: LoggerService
  ) {}

  async getAppOrThrow(): Promise<App> {
    const app = await this.getApp()

    if (app) {
      return app
    }

    throw new AppNotProvisionedException()
  }

  async getApp(): Promise<App | null> {
    // Find all & throw if more than one. Only 1 instance is supported.
    const apps = await this.appRepository.findAll()
    const app = apps?.find((app) => app.id === this.getId())
    if (apps?.length && apps.length > 1) {
      throw new ProvisionException('Multiple app instances found; this can lead to data corruption')
    }

    if (app) {
      return app
    }

    return null
  }

  // IMPORTANT: The admin API key is hashed by the caller not the service. That
  // allows us to have a declarative configuration file which is useful for
  // automations like development or cloud set up.
  async save(app: App): Promise<App> {
    await this.appRepository.save(app)

    return app
  }

  private getId(): string {
    return this.configService.get('app.id')
  }

  /** Temporary migration function, converting the key-value format of the App config into the table format */
  async migrateV1Data(): Promise<void> {
    const appV1 = await this.appRepository.findByIdV1(this.getId())
    const appV2 = await this.appRepository.findById(this.getId())
    if (appV1 && !appV2) {
      this.logger.log('Migrating App V1 data to V2')
      const keyring = this.configService.get('keyring')
      const app = App.parse({
        id: appV1.id,
        adminApiKeyHash: appV1.adminApiKey,
        encryptionMasterKey: appV1.masterKey,
        encryptionKeyringType: appV1.masterKey ? 'raw' : 'awskms',
        encryptionMasterAwsKmsArn: keyring.type === 'awskms' ? keyring.encryptionMasterAwsKmsArn : null,
        authDisabled: false
      })
      await this.appRepository.save(app)
      this.logger.log('App V1 data migrated to V2 Successfully')
    }
  }
}
