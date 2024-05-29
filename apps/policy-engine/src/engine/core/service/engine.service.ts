import { ConfigService } from '@narval/config-module'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { EngineNotProvisionedException } from '../exception/engine-not-provisioned.exception'

@Injectable()
export class EngineService {
  constructor(
    private configService: ConfigService<Config>,
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
      return engine
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
    return this.configService.get('engine.id')
  }
}
