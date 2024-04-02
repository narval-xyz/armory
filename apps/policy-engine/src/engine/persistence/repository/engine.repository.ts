import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { decode, encode } from '../../../shared/module/key-value/core/util/coercion.util'
import { Engine } from '../../../shared/type/domain.type'

@Injectable()
export class EngineRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findById(id: string): Promise<Engine | null> {
    const value = await this.keyValueService.get(this.getEngineKey(id))

    if (value) {
      return decode(Engine, value)
    }

    return null
  }

  async save(engine: Engine): Promise<Engine> {
    await this.keyValueService.set(this.getEngineKey(engine.id), encode(Engine, engine))

    return engine
  }

  getEngineKey(id: string): string {
    return `engine:${id}`
  }
}
