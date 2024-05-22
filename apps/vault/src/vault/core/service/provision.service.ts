import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../../../main.config'
import { App } from '../../../shared/type/domain.type'
import { AppService } from './app.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  constructor(
    private configService: ConfigService<Config>,
    private appService: AppService
  ) {}

  async provision(activate?: boolean): Promise<App | null> {
    let app = await this.appService.getApp()

    const isFirstTime = app === null

    // IMPORTANT: The order of internal methods call matters.
    if (isFirstTime) {
      this.logger.log('Start app provision')
      app = await this.createApp(activate)
      app = await this.maybeSetupEncryption()
    } else {
      this.logger.log('app already provisioned')
    }
    return app
  }

  // Activate is just a boolean that lets you return the adminApiKey one time
  // This enables you to provision the app at first-boot without access to the console, then to activate it to retrieve the api key through a REST endpoint.
  async activate(): Promise<App> {
    this.logger.log('Activate app')
    const app = await this.appService.getAppOrThrow()
    return this.appService.save({
      ...app,
      activated: true,
      adminApiKey: secret.generate() // rotate the API key
    })
  }

  private async createApp(activate?: boolean): Promise<App> {
    this.logger.log('Generate admin API key and save app')

    const app = await this.appService.save({
      id: this.getAppId(),
      adminApiKey: secret.generate(),
      activated: !!activate
    })
    return app
  }

  private async maybeSetupEncryption(): Promise<App> {
    // Get the app's latest state.
    const app = await this.appService.getAppOrThrow()

    if (app.masterKey) {
      this.logger.log('Skip master key set up because it already exists')
      return app
    }

    const keyring = this.configService.get('keyring')

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save app master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getAppId())
      const masterKey = await generateMasterKey(kek)

      return await this.appService.save({ ...app, masterKey })
    } else if (keyring.type === 'awskms' && keyring.masterAwsKmsArn) {
      this.logger.log('Using AWS KMS for encryption')
    }
    return app
  }

  private getAppId(): string {
    return this.configService.get('app.id')
  }
}
