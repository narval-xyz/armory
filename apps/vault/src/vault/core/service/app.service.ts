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

  // IMPORTANT: The admin API key is hashed by the caller not the service. That
  // allows us to have a declarative configuration file which is useful for
  // automations like development or cloud set up.
  async save(app: App): Promise<App> {
    await this.appRepository.save(app)

    return app
  }

  private getId(): string {
    return this.configService.get('app.id')
  }
}
