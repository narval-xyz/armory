import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { ProvisionException } from '../exception/provision.exception'
import { EngineService } from './engine.service'

@Injectable()
export class ProvisionService {
  // IMPORTANT: The provision service establishes encryption. Therefore, you
  // cannot have dependencies that rely on encryption to function. If you do,
  // you'll ran into an error due to a missing keyring.
  // Any process that requires encryption should be handled in the
  // BootstrapService.
  constructor(
    private configService: ConfigService<Config>,
    private engineService: EngineService,
    private logger: LoggerService
  ) {}

  // NOTE: The `adminApiKeyHash` argument is for test convinience in case it
  // needs to provision the application.
  async provision(adminApiKeyHash?: string): Promise<Engine> {
    const engine = await this.engineService.getEngine()

    const isNotProvisioned = !engine || !engine.adminApiKey

    if (isNotProvisioned) {
      this.logger.log('Start app provision')
      const provisionedEngine: Engine = await this.withMasterKey(engine || { id: this.getId() })

      const apiKey = adminApiKeyHash || this.getAdminApiKeyHash()

      if (apiKey) {
        return this.engineService.save({
          ...provisionedEngine,
          adminApiKey: apiKey
        })
      }

      return this.engineService.save(provisionedEngine)
    }

    this.logger.log('App already provisioned')

    return engine
  }

  private async withMasterKey(engine: Engine): Promise<Engine> {
    if (engine.masterKey) {
      this.logger.log('Skip master key set up because it already exists')

      return engine
    }

    const keyring = this.configService.get('keyring')

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save engine master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getId())
      const masterKey = await generateMasterKey(kek)

      return { ...engine, masterKey }
    } else if (keyring.type === 'awskms' && keyring.masterAwsKmsArn) {
      this.logger.log('Using AWS KMS for encryption')

      return engine
    } else {
      throw new ProvisionException('Unsupported keyring type')
    }
  }

  private getAdminApiKeyHash(): string | undefined {
    return this.configService.get('engine.adminApiKeyHash')
  }

  private getId(): string {
    return this.configService.get('engine.id')
  }
}
