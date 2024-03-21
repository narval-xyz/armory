import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes } from 'crypto'
import { Config } from '../../../policy-engine.config'
import { EngineService } from './engine.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  constructor(
    private configService: ConfigService<Config, true>,
    private engineService: EngineService
  ) {}

  async provision(): Promise<void> {
    this.logger.log('Start engine provision')

    const engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    if (isFirstTime) {
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
      return this.logger.log('Skip master key set up because it already exists')
    }

    const keyring = this.configService.get('keyring', { infer: true })

    if (keyring.type === 'raw') {
      this.logger.log('Generate and save engine master key')

      const { masterPassword } = keyring
      const kek = generateKeyEncryptionKey(masterPassword, this.getEngineId())
      const masterKey = await generateMasterKey(kek)

      await this.engineService.save({ ...engine, masterKey })
    }
  }

  private getEngineId(): string {
    return this.configService.get('engine.id', { infer: true })
  }
}
