import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { engineSchema } from '../../../shared/schema/engine.schema'
import { Engine } from '../../../shared/type/domain.type'

@Injectable()
export class EngineRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findById(id: string): Promise<Engine | null> {
    const value = await this.keyValueService.get(this.getKey(id))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(engine: Engine): Promise<Engine> {
    await this.keyValueService.set(this.getKey(engine.id), this.encode(engine))

    return engine
  }

  getKey(id: string): string {
    return `engine:${id}`
  }

  private encode(engine: Engine): string {
    return JSON.stringify(engine)
  }

  private decode(value: string): Engine {
    return engineSchema.parse(JSON.parse(value))
  }
}
