import { Injectable } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { App } from '../../core/type/app.type'

@Injectable()
export class AppRepository {
  constructor(private prismaService: PrismaService) {}

  async save(app: App): Promise<App> {
    await this.prismaService.application.upsert({
      where: { id: app.id },
      update: app,
      create: app
    })

    return app
  }

  async update(app: SetRequired<Partial<App>, 'id'>): Promise<App> {
    const model = await this.prismaService.application.update({
      where: { id: app.id },
      data: app
    })

    return App.parse(model)
  }

  async findById(id: string): Promise<App | null> {
    const model = await this.prismaService.application.findUnique({
      where: { id }
    })

    if (model) {
      return App.parse({
        ...model,
        adminApiKey: model.adminApiKey || undefined
      })
    }

    return null
  }
}
