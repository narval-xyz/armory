import { ConfigService } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { Controller, HttpStatus, Post } from '@nestjs/common'
import { Config } from '../../../../main.config'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { App } from '../../../../shared/type/domain.type'
import { AppService } from '../../../core/service/app.service'
import { ProvisionService } from '../../../core/service/provision.service'

type IsProvisioned = {
  isProvisioned: true
}

type State = {
  appId: string
  adminApiKey?: string
  encryptionType: string
  isMasterPasswordSet?: boolean
  isMasterKeySet?: boolean
  isMasterKmsArnSet?: boolean
}

type Provisioned = {
  isProvisioned: false
  state: State
}

type Response = IsProvisioned | Provisioned

@Controller('/provision')
export class ProvisionController {
  constructor(
    private provisionService: ProvisionService,
    private appService: AppService,
    private configService: ConfigService<Config>
  ) {}

  @Post()
  async provision(): Promise<Response> {
    const engine = await this.appService.getApp()
    const keyringConfig = this.configService.get('keyring')

    const isProvisioned = Boolean(
      (keyringConfig.type === 'raw' && engine?.masterKey) ||
        (keyringConfig.type === 'awskms' && keyringConfig?.masterAwsKmsArn)
    )

    if (engine && isProvisioned && engine.adminApiKey) {
      return { isProvisioned: true }
    }

    if (engine && isProvisioned && !engine.adminApiKey) {
      const adminApiKey = secret.generate()

      await this.appService.save({
        ...engine,
        adminApiKey: secret.hash(adminApiKey)
      })

      return {
        isProvisioned: false,
        state: this.getState({ app: engine, keyringConfig, adminApiKey })
      }
    }

    try {
      const activatedEngine = await this.provisionService.provision()

      return {
        isProvisioned: false,
        state: this.getState({
          app: activatedEngine,
          keyringConfig,
          adminApiKey: activatedEngine?.adminApiKey
        })
      }
    } catch (error) {
      throw new ApplicationException({
        message: 'Something went wrong provisioning the app',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }
  }

  private getState(opt: { app: App; keyringConfig: Config['keyring']; adminApiKey?: string }): State {
    const { app, keyringConfig, adminApiKey } = opt

    return {
      appId: app.id,
      adminApiKey,
      encryptionType: keyringConfig.type,
      ...(keyringConfig.type === 'raw'
        ? {
            isMasterPasswordSet: Boolean(keyringConfig.masterPassword),
            isMasterKeySet: Boolean(app.masterKey)
          }
        : {}),
      ...(keyringConfig.type === 'awskms'
        ? {
            isMasterKmsArnSet: Boolean(keyringConfig.masterAwsKmsArn)
          }
        : {})
    }
  }
}
