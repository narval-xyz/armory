import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
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

  async create(engine: Engine): Promise<Engine> {
    if (await this.keyValueService.get(this.getKey(engine.id))) {
      throw new ApplicationException({
        message: 'Engine already exist',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

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
