import { ConfigService } from '@narval/config-module'
import { generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { generatePrivateKey } from 'viem/accounts'
import { Config } from '../../../policy-engine.config'
import { ProvisionException } from '../exception/provision.exception'
import { EngineSignerConfigService } from './engine-signer-config.service'
import { EngineService } from './engine.service'

@Injectable()
export class ProvisionService {
  private logger = new Logger(ProvisionService.name)

  constructor(
    private configService: ConfigService<Config>,
    private engineService: EngineService,
    private engineSignerConfigService: EngineSignerConfigService
  ) {}

  async provision(): Promise<void> {
    const engine = await this.engineService.getEngine()

    const isFirstTime = engine === null

    if (isFirstTime) {
      this.logger.log('Start engine provision')

      // IMPORTANT: The order of internal methods call matters.
      await this.createEngine()
      await this.maybeSetupEncryption()
      await this.maybeSetupSigningPrivateKey()
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

  private async maybeSetupSigningPrivateKey(): Promise<void> {
    const signerConfig = await this.engineSignerConfigService.getSignerConfig()

    if (signerConfig) {
      return this.logger.log('Skip SECP256K signer set up')
    }

    this.logger.log('Generate and save engine signer private key')

    const result = await this.engineSignerConfigService.save({
      type: 'PRIVATE_KEY',
      privateKey: generatePrivateKey()
    })

    if (!result) {
      throw new ProvisionException('Failed to save engine signer configuration')
    }
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
