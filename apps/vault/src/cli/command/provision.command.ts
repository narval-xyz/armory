/* eslint-disable no-console */

import { ConfigService } from '@nestjs/config'
import { Command, CommandRunner } from 'nest-commander'
import { Config } from '../../main.config'
import { AppService } from '../../vault/core/service/app.service'
import { ProvisionService } from '../../vault/core/service/provision.service'

@Command({
  name: 'provision',
  description: 'Provision the app for the first time'
})
export class ProvisionCommand extends CommandRunner {
  constructor(
    private provisionService: ProvisionService,
    private appService: AppService,
    private configService: ConfigService<Config, true>
  ) {
    super()
  }

  async run(): Promise<void> {
    const app = await this.appService.getApp()

    if (app && app.masterKey) {
      return console.log('App already provisioned')
    }

    await this.provisionService.provision()

    try {
      const keyring = this.configService.get('keyring', { infer: true })
      const app = await this.appService.getAppOrThrow()

      console.log('App ID:', app.id)
      console.log('App admin API key:', app.adminApiKey)
      console.log('Encryption type:', keyring.type)

      if (keyring.type === 'raw') {
        console.log(`Is encryption master password set? ${keyring.masterPassword ? '✅' : '❌'}`)
        console.log(`Is encryption master key set? ${app.masterKey ? '✅' : '❌'}`)
      }

      if (keyring.type === 'awskms') {
        console.log(`Is encryption master KMS ARN set? ${keyring.masterAwsKmsArn ? '✅' : '❌'}`)
      }
    } catch (error) {
      console.log('Something went wrong provisioning the app', error)
    }
  }
}
