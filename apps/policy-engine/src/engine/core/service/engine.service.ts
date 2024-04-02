import { ConfigService } from '@narval/config-module'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { EngineNotProvisionedException } from '../exception/engine-not-provisioned.exception'
import { EngineSignerConfigService } from './engine-signer-config.service'

@Injectable()
export class EngineService {
  constructor(
    private configService: ConfigService<Config>,
    private engineSignerConfigService: EngineSignerConfigService,
    private engineRepository: EngineRepository
  ) {}

  async getEngineOrThrow(): Promise<Engine> {
    const engine = await this.getEngine()

    if (engine) {
      return engine
    }

    throw new EngineNotProvisionedException()
  }

  async getEngine(): Promise<Engine | null> {
    const engine = await this.engineRepository.findById(this.getId())

    if (engine) {
      const enginePublicJwk = await this.engineSignerConfigService.getEnginePublicJwk()
      return { ...engine, publicJwk: enginePublicJwk || undefined }
    }

    return null
  }

  async save(engine: Engine): Promise<Engine> {
    return this.engineRepository.save(engine)
  }

  private getId(): string {
    return this.configService.get('engine.id')
  }
}
