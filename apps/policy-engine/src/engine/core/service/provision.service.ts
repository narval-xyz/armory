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
    const engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    // IMPORTANT: The order of internal methods call matters.
    if (isFirstTime) {
      this.logger.log('Start app provision')

      const adminApiKey = this.getOrGenerateAdminApiKey()
      const newEngine: Engine = {
        id: this.getEngineId(),
        adminApiKey,
        activated: !!activate
      }

      const withEncryption = await this.setupEncryption(newEngine)

      await this.engineService.save({
        ...withEncryption,
        adminApiKey: secret.hash(adminApiKey)
      })

      return withEncryption
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

    const adminApiKey = this.getOrGenerateAdminApiKey()

    console.log({ adminApiKey, hash: secret.hash(adminApiKey) })

    const app = await this.engineService.update({
      activated: true,
      adminApiKey: secret.hash(adminApiKey)
    })

    return { ...app, adminApiKey }
  }

  private async setupEncryption(engine: Engine): Promise<Engine> {
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

      return { ...engine, masterKey }
    } else if (keyring.type === 'awskms' && keyring.masterAwsKmsArn) {
      this.logger.log('Using AWS KMS for encryption')
    } else {
      throw new ProvisionException('Unsupported keyring type')
    }

    return engine
  }

  private getOrGenerateAdminApiKey(): string {
    return this.configService.get('engine.adminApiKey') || secret.generate()
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
