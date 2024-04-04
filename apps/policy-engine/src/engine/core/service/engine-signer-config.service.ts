import { ConfigService } from '@narval/config-module'
import { PublicKey, privateKeyToHex, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { SignerConfig } from '../../../shared/type/domain.type'
import { EngineSignerConfigRepository } from '../../persistence/repository/engine-signer-config.repository'
import { EngineSignerNotFoundException } from '../exception/engine-signer-not-found.exception'

@Injectable()
export class EngineSignerConfigService {
  constructor(
    private configService: ConfigService<Config>,
    private engineSignerConfigRepository: EngineSignerConfigRepository
  ) {}

  async save(signerConfig: SignerConfig): Promise<boolean> {
    return this.engineSignerConfigRepository.save(this.getEngineId(), signerConfig)
  }

  async getPublicJwkOrThrow(): Promise<PublicKey> {
    const signerConfig = await this.getSignerConfigOrThrow()
    const hex = await privateKeyToHex(signerConfig.key)

    return secp256k1PrivateKeyToPublicJwk(hex)
  }

  async getSignerConfigOrThrow(): Promise<SignerConfig> {
    const signerConfig = await this.getSignerConfig()

    if (signerConfig) {
      return signerConfig
    }

    throw new EngineSignerNotFoundException()
  }

  async getSignerConfig(): Promise<SignerConfig | null> {
    return this.engineSignerConfigRepository.findByEngineId(this.getEngineId())
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
