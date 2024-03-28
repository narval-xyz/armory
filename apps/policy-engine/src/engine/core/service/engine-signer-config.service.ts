import { ConfigService } from '@narval/config-module'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { EngineSignerConfig } from '../../../shared/type/domain.type'
import { EngineSignerConfigRepository } from '../../persistence/repository/engine-signer-config.repository'
import { EngineSignerNotFoundException } from '../exception/engine-signer-not-found.exception'

@Injectable()
export class EngineSignerConfigService {
  constructor(
    private configService: ConfigService<Config>,
    private engineSignerConfigRepository: EngineSignerConfigRepository
  ) {}

  async save(signerConfig: EngineSignerConfig): Promise<boolean> {
    return this.engineSignerConfigRepository.save(this.getEngineId(), signerConfig)
  }

  async getSignerConfigOrThrow(): Promise<EngineSignerConfig> {
    const signerConfig = await this.getSignerConfig()

    if (signerConfig) {
      return signerConfig
    }

    throw new EngineSignerNotFoundException()
  }

  async getSignerConfig(): Promise<EngineSignerConfig | null> {
    return this.engineSignerConfigRepository.findByEngineId(this.getEngineId())
  }

  private getEngineId(): string {
    return this.configService.get('engine.id')
  }
}
