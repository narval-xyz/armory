import { ConfigService } from '@narval/config-module'
import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common'
import { Config } from '../../../../main.config'
import { AppService } from '../../../core/service/app.service'
import { ProvisionService } from '../../../core/service/provision.service'

type ProvisionResponse = {
  appId: string
  adminApiKey: string | undefined
  encryptionType: string
  isMasterPasswordSet?: boolean
  isMasterKeySet?: boolean
  isMasterKmsArnSet?: boolean
}

@Controller('/provision')
export class ProvisionController {
  constructor(
    private provisionService: ProvisionService,
    private appService: AppService,
    private configService: ConfigService<Config>
  ) {}

  @Post()
  async provision(): Promise<string | ProvisionResponse> {
    const app = await this.appService.getApp()
    const keyringConfig = this.configService.get('keyring')

    const isProvisioned =
      (keyringConfig.type === 'raw' && app?.masterKey) ||
      (keyringConfig.type === 'awskms' && keyringConfig?.masterAwsKmsArn)

    if (app && isProvisioned && app.activated) {
      return 'App already provisioned'
    }

    let adminApiKey
    // if we've already provisioned but not activate, just flag it.
    if (app && isProvisioned && !app.activated) {
      const activatedApp = await this.provisionService.activate()
      adminApiKey = activatedApp.adminApiKey
    }
    // Provision the app if it hasn't yet
    else {
      const newApp = await this.provisionService.provision(true)
      adminApiKey = newApp?.adminApiKey
    }

    try {
      const app = await this.appService.getAppOrThrow()

      const response: ProvisionResponse = {
        appId: app.id,
        adminApiKey,
        encryptionType: keyringConfig.type
      }

      if (keyringConfig.type === 'raw') {
        response.isMasterPasswordSet = Boolean(keyringConfig.masterPassword)
        response.isMasterKeySet = Boolean(app.masterKey)
      }

      if (keyringConfig.type === 'awskms') {
        response.isMasterKmsArnSet = Boolean(keyringConfig.masterAwsKmsArn)
      }

      return response
    } catch (error) {
      throw new HttpException('Something went wrong provisioning the app', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
