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

  async provision(): Promise<void> {
    const engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    if (isFirstTime) {
      this.logger.log('Start engine provision')

      // IMPORTANT: The order of internal methods call matters.
      await this.createEngine()
      await this.maybeSetupEncryption()
    } else {
      this.logger.log('Skip engine provision')
    }
  }

  private async createEngine(): Promise<void> {
    this.logger.log('Generate admin API key and save engine')

    await this.engineService.save({
      id: this.getEngineId(),
      adminApiKey: randomBytes(20).toString('hex')
    })
  }

  private async maybeSetupEncryption(): Promise<void> {
    // Get the engine's latest state.
    const engine = await this.engineService.getEngineOrThrow()

    if (engine.masterKey) {
      return this.logger.log('Skip master key set up')
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
