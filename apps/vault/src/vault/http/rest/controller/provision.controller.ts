import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../../../main.config'
import { AppService } from '../../../core/service/app.service'
import { ProvisionService } from '../../../core/service/provision.service'

type ProvisionResponse = {
  appId: string
  adminApiKey: string
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
    private configService: ConfigService<Config, true>
  ) {}

  @Post()
  async provision(): Promise<string | ProvisionResponse> {
    const app = await this.appService.getApp()

    if (app && app.masterKey) {
      return 'App already provisioned'
    }

    await this.provisionService.provision()

    try {
      const keyring = this.configService.get('keyring', { infer: true })
      const app = await this.appService.getAppOrThrow()

      const response: ProvisionResponse = {
        appId: app.id,
        adminApiKey: app.adminApiKey,
        encryptionType: keyring.type
      }

      if (keyring.type === 'raw') {
        response.isMasterPasswordSet = Boolean(keyring.masterPassword)
        response.isMasterKeySet = Boolean(app.masterKey)
      }

      if (keyring.type === 'awskms') {
        response.isMasterKmsArnSet = Boolean(keyring.masterAwsKmsArn)
      }

      return response
    } catch (error) {
      throw new HttpException('Something went wrong provisioning the app', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
