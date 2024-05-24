import { ConfigService } from '@narval/config-module'
import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common'
import { Config } from '../../../../policy-engine.config'
import { EngineService } from '../../../core/service/engine.service'
import { ProvisionService } from '../../../core/service/provision.service'

type AlreadyProvisioned = {
  alreadyProvisioned: true
}

type State = {
  appId: string
  adminApiKey: string | undefined
  encryptionType: string
  isMasterPasswordSet?: boolean
  isMasterKeySet?: boolean
  isMasterKmsArnSet?: boolean
}

type Provisioned = {
  alreadyProvisioned: false
  state: State
}

type Response = AlreadyProvisioned | Provisioned

@Controller('/provision')
export class ProvisionController {
  constructor(
    private provisionService: ProvisionService,
    private engineService: EngineService,
    private configService: ConfigService<Config>
  ) {}

  @Post()
  async provision(): Promise<Response> {
    const engine = await this.engineService.getEngine()
    const keyringConfig = this.configService.get('keyring')

    const isProvisioned = Boolean(
      (keyringConfig.type === 'raw' && engine?.masterKey) ||
        (keyringConfig.type === 'awskms' && keyringConfig?.masterAwsKmsArn)
    )

    if (engine && isProvisioned && engine.activated) {
      return { alreadyProvisioned: true }
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

      const state: State = {
        appId: engine.id,
        adminApiKey,
        encryptionType: keyringConfig.type
      }

      if (keyringConfig.type === 'raw') {
        state.isMasterPasswordSet = Boolean(keyringConfig.masterPassword)
        state.isMasterKeySet = Boolean(engine.masterKey)
      }

      if (keyringConfig.type === 'awskms') {
        state.isMasterKmsArnSet = Boolean(keyringConfig.masterAwsKmsArn)
      }

      return { alreadyProvisioned: false, state }
    } catch (error) {
      throw new HttpException('Something went wrong provisioning the app', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
