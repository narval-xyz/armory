import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../../../main.config'
import { App } from '../../../shared/type/domain.type'
import { ProvisionException } from '../exception/provision.exception'
import { AppService } from './app.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  constructor(
    private configService: ConfigService<Config>,
    private appService: AppService
  ) {}

  async provision(adminApiKeyHash?: string): Promise<App> {
    const app = await this.appService.getApp()

    const isFirstBoot = app === null

    if (isFirstBoot) {
      this.logger.log('Start app provision')

      const provisionedApp: App = await this.withMasterKey({
        id: this.getId()
      })

      const apiKey = adminApiKeyHash || this.getAdminApiKeyHash()

      if (apiKey) {
        this.logger.log('Import admin API key hash')

        return this.appService.save({
          ...provisionedApp,
          adminApiKey: apiKey
        })
      }

      return this.appService.save(provisionedApp)
    }

    this.logger.log('App already provisioned')

    return app
  }

  private async withMasterKey(app: App): Promise<App> {
    if (app.masterKey) {
      this.logger.log('Skip master key set up because it already exists')

      return app
    }

    const keyring = this.configService.get('keyring')

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save engine master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getId())
      const masterKey = await generateMasterKey(kek)

      return { ...app, masterKey }
    } else if (keyring.type === 'awskms' && keyring.masterAwsKmsArn) {
      this.logger.log('Using AWS KMS for encryption')

      return app
    } else {
      throw new ProvisionException('Unsupported keyring type')
    }
  }

  private getAdminApiKeyHash(): string | undefined {
    return this.configService.get('app.adminApiKeyHash')
  }

  private getId(): string {
    return this.configService.get('app.id')
  }
}
