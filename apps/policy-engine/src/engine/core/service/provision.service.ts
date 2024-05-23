import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { secret } from '@narval/nestjs-shared'
import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
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

  async provision(activate?: boolean): Promise<Engine | null> {
    let engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    // IMPORTANT: The order of internal methods call matters.
    if (isFirstTime) {
      this.logger.log('Start app provision')
      engine = await this.createEngine(activate)
      engine = await this.maybeSetupEncryption()
    } else {
      this.logger.log('App already provisioned')
    }
    return engine
  }

  // Activate is just a boolean that lets you return the adminApiKey one time.
  // This enables you to provision the engine at first-boot without access to
  // the console, then to activate it to retrieve the api key through a REST
  // endpoint.
  async activate(): Promise<Engine> {
    this.logger.log('Activate app')

    return this.engineService.update({
      activated: true,
      adminApiKey: this.getOrGenerateAdminApiKey()
    })
  }

  private async createEngine(activate?: boolean): Promise<Engine> {
    this.logger.log('Generate admin API key and save engine')

    const app = await this.engineService.save({
      id: this.getEngineId(),
      activated: !!activate,
      adminApiKey: this.getOrGenerateAdminApiKey()
    })
    return app
  }

  private async maybeSetupEncryption(): Promise<Engine> {
    // Get the engine's latest state.
    const engine = await this.engineService.getEngineOrThrow()

    if (engine.masterKey) {
      this.logger.log('Skip master key set up because it already exists')
      return engine
    }

    const keyring = this.configService.get('keyring')

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save engine master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getEngineId())
      const masterKey = await generateMasterKey(kek)

      // WARN: This save hashes the key twice.
      return await this.engineService.update({ masterKey })
    } else if (keyring.type === 'awskms' && keyring.masterAwsKmsArn) {
      this.logger.log('Using AWS KMS for encryption')
    } else {
      throw new ProvisionException('Unsupported keyring type')
    }
    return engine
  }

  private getOrGenerateAdminApiKey(): string {
    return secret.hash(this.configService.get('adminApiKey') || secret.generate())
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
