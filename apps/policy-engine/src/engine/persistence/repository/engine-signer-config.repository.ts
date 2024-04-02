import { Injectable, Logger } from '@nestjs/common'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { decode, encode } from '../../../shared/module/key-value/core/util/coercion.util'
import { EngineSignerConfig } from '../../../shared/type/domain.type'
import { EngineSignerConfigService } from '../../core/service/engine-signer-config.service'

@Injectable()
export class EngineSignerConfigRepository {
  private logger = new Logger(EngineSignerConfigService.name)

  constructor(private encryptKeyValueService: EncryptKeyValueService) {}

  async save(engineId: string, signerConfig: EngineSignerConfig): Promise<boolean> {
    try {
      await this.encryptKeyValueService.set(this.getKey(engineId), this.encode(signerConfig))

      return true
    } catch (error) {
      this.logger.error('Fail to save engine signer configuration', {
        message: error.message,
        stack: error.stack
      })

      return false
    }
  }

  async findByEngineId(engineId: string): Promise<EngineSignerConfig | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(engineId))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  getKey(id: string): string {
    return `engine:${id}:signer-config`
  }

  private encode(engine: EngineSignerConfig): string {
    return encode(EngineSignerConfig, engine)
  }

  private decode(value: string): EngineSignerConfig {
    return decode(EngineSignerConfig, value)
  }
}
