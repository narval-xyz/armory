import { ConfigService } from '@narval/config-module'
import { Command, CommandRunner } from 'nest-commander'
import { EngineService } from '../../engine/core/service/engine.service'
import { ProvisionService } from '../../engine/core/service/provision.service'
import { Config } from '../../policy-engine.config'

@Command({
  name: 'provision',
  description: 'Provision the policy engine for the first time'
})
export class ProvisionCommand extends CommandRunner {
  constructor(
    private provisionService: ProvisionService,
    private engineService: EngineService,
    private configService: ConfigService<Config>
  ) {
    super()
  }

  async run(): Promise<void> {
    const engine = await this.engineService.getEngine()

    if (engine && engine.masterKey) {
      return console.log('Engine already provisioned')
    }

    await this.provisionService.provision()

    try {
      const keyring = this.configService.get('keyring')
      const engine = await this.engineService.getEngineOrThrow()

      console.log('Engine ID:', engine.id)
      console.log('Engine admin API key:', engine.adminApiKey)
      console.log('Encryption type:', keyring.type)

      if (keyring.type === 'raw') {
        console.log(`Is encryption master password set? ${keyring.masterPassword ? '✅' : '❌'}`)
        console.log(`Is encryption master key set? ${engine.masterKey ? '✅' : '❌'}`)
      }

      if (keyring.type === 'awskms') {
        console.log(`Is encryption master KMS ARN set? ${keyring.masterAwsKmsArn ? '✅' : '❌'}`)
      }
    } catch (error) {
      console.log('Something went wrong provisioning the engine', error)
    }
  }
}
