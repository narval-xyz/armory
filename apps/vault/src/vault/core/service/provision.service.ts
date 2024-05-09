import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes } from 'crypto'
import { Config } from '../../../main.config'
import { AppService } from './app.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  constructor(
    private configService: ConfigService<Config, true>,
    private appService: AppService
  ) {}

  async provision(activate?: boolean): Promise<void> {
    const app = await this.appService.getApp()

    const isFirstTime = app === null

    // IMPORTANT: The order of internal methods call matters.
    if (isFirstTime) {
      this.logger.log('Start app provision')
      await this.createApp(activate)
      await this.maybeSetupEncryption()
    } else {
      this.logger.log('app already provisioned')
    }
  }

  // Activate is just a boolean that lets you return the adminApiKey one time
  // This enables you to provision the app at first-boot without access to the console, then to activate it to retrieve the api key through a REST endpoint.
  async activate(): Promise<void> {
    this.logger.log('Activate app')
    const app = await this.appService.getAppOrThrow()
    await this.appService.save({ ...app, activated: true })
  }

  private async createApp(activate?: boolean): Promise<void> {
    this.logger.log('Generate admin API key and save app')

    await this.appService.save({
      id: this.getAppId(),
      adminApiKey: randomBytes(20).toString('hex'),
      activated: !!activate
    })
  }

  private async maybeSetupEncryption(): Promise<void> {
    // Get the app's latest state.
    const app = await this.appService.getAppOrThrow()

    if (app.masterKey) {
      return this.logger.log('Skip master key set up because it already exists')
    }

    const keyring = this.configService.get('keyring', { infer: true })

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save app master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getAppId())
      const masterKey = await generateMasterKey(kek)

      await this.appService.save({ ...app, masterKey })
    }
  }

  private getAppId(): string {
    return this.configService.get('app.id', { infer: true })
  }
}
