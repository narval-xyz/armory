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

  async provision(): Promise<void> {
    this.logger.log('Start app provision')

    const app = await this.appService.getApp()

    const isFirstTime = app === null

    // IMPORTANT: The order of internal methods call matters.

    if (isFirstTime) {
      await this.createApp()
      await this.maybeSetupEncryption()
    }
  }

  private async createApp(): Promise<void> {
    this.logger.log('Generate admin API key and save app')

    await this.appService.save({
      id: this.getAppId(),
      adminApiKey: randomBytes(20).toString('hex')
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
