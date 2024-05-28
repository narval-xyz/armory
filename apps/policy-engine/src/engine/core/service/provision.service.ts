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

  async provision(): Promise<Engine> {
    const engine = await this.engineService.getEngine()

    const isFirstBoot = engine === null

    if (isFirstBoot) {
      this.logger.log('Start app provision')

      const provisionedEngine: Engine = await this.withMasterKey({
        id: this.getId()
      })

      const adminApiKey = this.getAdminApiKey()

      if (adminApiKey) {
        const activatedEngine = {
          ...provisionedEngine,
          adminApiKey
        }

        await this.engineService.save({
          ...activatedEngine,
          adminApiKey: secret.hash(adminApiKey)
        })

        return activatedEngine
      }

      return this.engineService.save(provisionedEngine)
    } else {
      this.logger.log('App already provisioned')
    }

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
    } else {
      throw new ProvisionException('Unsupported keyring type')
    }

    return engine
  }

  private getAdminApiKey(): string | undefined {
    return this.configService.get('engine.adminApiKey')
  }

  private getId(): string {
    return this.configService.get('engine.id')
  }
}
