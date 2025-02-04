import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { EngineNotProvisionedException } from '../exception/engine-not-provisioned.exception'
import { ProvisionException } from '../exception/provision.exception'

@Injectable()
export class EngineService {
  constructor(
    private configService: ConfigService<Config>,
    private engineRepository: EngineRepository,
    private logger: LoggerService
  ) {}

  async getEngineOrThrow(): Promise<Engine> {
    const engine = await this.getEngine()

    if (engine) {
      return engine
    }

    throw new EngineNotProvisionedException()
  }

  async getEngine(): Promise<Engine | null> {
    const apps = await this.engineRepository.findAll()

    const app = apps?.find((app) => app.id === this.getId())
    if (apps?.length && apps.length > 1) {
      throw new ProvisionException('Multiple app instances found; this can lead to data corruption')
    }

    if (app) {
      return app
    }

    return null
  }

  // IMPORTANT: The admin API key is hashed by the caller not the service. That
  // allows us to have a declarative configuration file which is useful for
  // automations like development or cloud set up.
  async save(engine: Engine): Promise<Engine> {
    await this.engineRepository.save(engine)

    return engine
  }

  private getId(): string {
    return this.configService.get('app.id')
  }

  /** Temporary migration function, converting the key-value format of the App config into the table format */
  async migrateV1Data(): Promise<void> {
    const appV1 = await this.engineRepository.findByIdV1(this.getId())
    const appV2 = await this.engineRepository.findById(this.getId())
    if (appV1 && !appV2) {
      this.logger.log('Migrating App V1 data to V2')
      const keyring = this.configService.get('keyring')
      const app = Engine.parse({
        id: appV1.id,
        adminApiKeyHash: appV1.adminApiKey,
        encryptionMasterKey: appV1.masterKey,
        encryptionKeyringType: appV1.masterKey ? 'raw' : 'awskms',
        encryptionMasterAwsKmsArn: keyring.type === 'awskms' ? keyring.encryptionMasterAwsKmsArn : null,
        authDisabled: false
      })
      await this.engineRepository.save(app)
      this.logger.log('App V1 data migrated to V2 Successfully')
    }
  }
}
