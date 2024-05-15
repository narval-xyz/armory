import { coerce } from '@narval/nestjs-shared'
import { Injectable, Logger } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { SignerConfig } from '../../../shared/type/domain.type'
import { EngineSignerConfigService } from '../../core/service/engine-signer-config.service'

@Injectable()
export class EngineSignerConfigRepository {
  private logger = new Logger(EngineSignerConfigService.name)

  constructor(private encryptKeyValueService: EncryptKeyValueService) {}

  async save(engineId: string, signerConfig: SignerConfig): Promise<boolean> {
    try {
      await this.encryptKeyValueService.set(this.getKey(engineId), coerce.encode(SignerConfig, signerConfig))

      return true
    } catch (error) {
      this.logger.error('Fail to save engine signer configuration', {
        message: error.message,
        stack: error.stack
      })

      return false
    }
  }

  async findByEngineId(engineId: string): Promise<SignerConfig | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(engineId))

    if (value) {
      return coerce.decode(SignerConfig, value)
    }

    return null
  }

  getKey(id: string): string {
    return `engine:${id}:signer-config`
  }
}
