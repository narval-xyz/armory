import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { Config } from '../../../policy-engine.config'
import { ProvisionException } from '../exception/provision.exception'
import { EngineService } from './engine.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  // IMPORTANT: The provision service establishes encryption. Therefore, you
  // cannot have dependencies that rely on encryption to function. If you do,
  // you'll ran into an error due to a missing keyring.
  // Any process that requires encryption should be handled in the
  // BootstrapService.
  constructor(
    private configService: ConfigService<Config>,
    private engineService: EngineService
  ) {}

  async provision(activate?: boolean): Promise<void> {
    const engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    // IMPORTANT: The order of internal methods call matters.
    if (isFirstTime) {
      this.logger.log('Start app provision')
      await this.createEngine(activate)
      await this.maybeSetupEncryption()
    } else {
      this.logger.log('App already provisioned')
    }
  }

  // Activate is just a boolean that lets you return the adminApiKey one time
  // This enables you to provision the engine at first-boot without access to the console, then to activate it to retrieve the api key through a REST endpoint.
  async activate(): Promise<void> {
    this.logger.log('Activate app')
    const engine = await this.engineService.getEngineOrThrow()
    await this.engineService.save({ ...engine, activated: true })
  }

  private async createEngine(activate?: boolean): Promise<void> {
    this.logger.log('Generate admin API key and save engine')

    await this.engineService.save({
      id: this.getEngineId(),
      adminApiKey: randomBytes(20).toString('hex'),
      activated: !!activate
    })
  }

  private async maybeSetupEncryption(): Promise<void> {
    // Get the engine's latest state.
    const engine = await this.engineService.getEngineOrThrow()

    if (engine.masterKey) {
      return this.logger.log('Skip master key set up because it already exists')
    }

    const keyring = this.configService.get('keyring')

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save engine master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getEngineId())
      const masterKey = await generateMasterKey(kek)

      await this.engineService.save({ ...engine, masterKey })
    } else {
      throw new ProvisionException('Unsupported keyring type', { type: keyring.type })
    }
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
