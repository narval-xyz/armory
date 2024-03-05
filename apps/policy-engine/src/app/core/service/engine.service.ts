import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { EngineNotProvisionedException } from '../exception/engine-not-provisioned.exception'

@Injectable()
export class EngineService {
  constructor(
    private configService: ConfigService<Config, true>,
    private engineRepository: EngineRepository
  ) {}

  async getEngine(): Promise<Engine> {
    const engine = await this.engineRepository.findById(this.getId())

    if (engine) {
      return engine
    }

    throw new EngineNotProvisionedException()
  }

  async create(engine: Engine): Promise<Engine> {
    return this.engineRepository.create(engine)
  }

  private getId(): string {
    return this.configService.get('engine.id', { infer: true })
  }
}
