import { ConfigService } from '@narval/config-module'
import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common'
import { Config } from '../../../../policy-engine.config'
import { EngineService } from '../../../core/service/engine.service'
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
    private engineService: EngineService,
    private configService: ConfigService<Config>
  ) {}

  @Post()
  async provision(): Promise<string | ProvisionResponse> {
    const engine = await this.engineService.getEngine()
    const keyringConfig = this.configService.get('keyring')

    const isProvisioned =
      (keyringConfig.type === 'raw' && engine?.masterKey) ||
      (keyringConfig.type === 'awskms' && keyringConfig?.masterAwsKmsArn)

    if (engine && isProvisioned && engine.activated) {
      return 'App already provisioned'
    }

    let adminApiKey
    // if we've already provisioned but not activate, just flag it.
    if (engine && isProvisioned && !engine.activated) {
      const activatedApp = await this.provisionService.activate()
      adminApiKey = activatedApp.adminApiKey
    }
    // Provision the engine if it hasn't yet
    else {
      const newApp = await this.provisionService.provision(true)
      adminApiKey = newApp?.adminApiKey
    }

    try {
      const engine = await this.engineService.getEngineOrThrow()

      const response: ProvisionResponse = {
        appId: engine.id,
        adminApiKey,
        encryptionType: keyringConfig.type
      }

      if (keyringConfig.type === 'raw') {
        response.isMasterPasswordSet = Boolean(keyringConfig.masterPassword)
        response.isMasterKeySet = Boolean(engine.masterKey)
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
