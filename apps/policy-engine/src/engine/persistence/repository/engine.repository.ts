import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { Engine } from '../../../shared/type/domain.type'

@Injectable()
export class EngineRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findById(id: string): Promise<Engine | null> {
    const value = await this.keyValueService.get(this.getEngineKey(id))

    if (value) {
      return coerce.decode(Engine, value)
    }

    return null
  }

  async save(engine: Engine): Promise<Engine> {
    await this.keyValueService.set(this.getEngineKey(engine.id), coerce.encode(Engine, engine))

    return engine
  }

  getEngineKey(id: string): string {
    return `engine:${id}`
  }
}
