import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { App } from '../../../shared/type/domain.type'

@Injectable()
export class AppRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findById(id: string): Promise<App | null> {
    const value = await this.keyValueService.get(this.getKey(id))

    if (value) {
      return coerce.decode(App, value)
    }

    return null
  }

  async save(app: App): Promise<App> {
    await this.keyValueService.set(this.getKey(app.id), coerce.encode(App, app))

    return app
  }

  getKey(id: string): string {
    return `app:${id}`
  }
}
