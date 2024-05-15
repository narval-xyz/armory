import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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
    private configService: ConfigService<Config, true>
  ) {}

  @Post()
  async provision(): Promise<string | ProvisionResponse> {
    const engine = await this.engineService.getEngine()

    if (engine && engine.masterKey && engine.activated) {
      return 'App already provisioned'
    }

    let adminApiKey
    // if we've already provisioned but not activate, just flag it.
    if (engine && engine.masterKey && !engine.activated) {
      const activatedApp = await this.provisionService.activate()
      adminApiKey = activatedApp.adminApiKey
    }
    // Provision the engine if it hasn't yet
    else {
      await this.provisionService.provision(true)
      const newApp = await this.provisionService.provision(true)
      adminApiKey = newApp?.adminApiKey
    }

    try {
      const keyring = this.configService.get('keyring', { infer: true })
      const engine = await this.engineService.getEngineOrThrow()

      const response: ProvisionResponse = {
        appId: engine.id,
        adminApiKey,
        encryptionType: keyring.type
      }

      if (keyring.type === 'raw') {
        response.isMasterPasswordSet = Boolean(keyring.masterPassword)
        response.isMasterKeySet = Boolean(engine.masterKey)
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
