import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { appSchema } from '../../../shared/schema/app.schema'
import { App } from '../../../shared/type/domain.type'

@Injectable()
export class AppRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findById(id: string): Promise<App | null> {
    const value = await this.keyValueService.get(this.getKey(id))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(app: App): Promise<App> {
    await this.keyValueService.set(this.getKey(app.id), this.encode(app))

    return app
  }

  getKey(id: string): string {
    return `app:${id}`
  }

  private encode(app: App): string {
    return JSON.stringify(app)
  }

  private decode(value: string): App {
    return appSchema.parse(JSON.parse(value))
  }
}
