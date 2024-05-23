import { ConfigService } from '@narval/config-module'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../main.config'
import { App } from '../../../shared/type/domain.type'
import { AppRepository } from '../../persistence/repository/app.repository'
import { AppNotProvisionedException } from '../exception/app-not-provisioned.exception'

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<Config>,
    private appRepository: AppRepository
  ) {}

  async getAppOrThrow(): Promise<App> {
    const app = await this.getApp()

    if (app) {
      return app
    }

    throw new AppNotProvisionedException()
  }

  async getApp(): Promise<App | null> {
    const app = await this.appRepository.findById(this.getId())

    if (app) {
      return app
    }

    return null
  }

  async save(app: App): Promise<App> {
    await this.appRepository.save(app)

    return app
  }

  async update(app: Partial<App>): Promise<App> {
    const existingApp = await this.getAppOrThrow()
    const updatedApp = { ...existingApp, ...app }

    await this.appRepository.save(updatedApp)

    return updatedApp
  }

  private getId(): string {
    return this.configService.get('app.id')
  }
}
