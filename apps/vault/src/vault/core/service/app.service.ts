import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../../main.config'
import { App } from '../../../shared/type/domain.type'
import { AppRepository } from '../../persistence/repository/app.repository'
import { AppNotProvisionedException } from '../exception/app-not-provisioned.exception'

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<Config, true>,
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
    return this.appRepository.save(app)
  }

  private getId(): string {
    return this.configService.get('app.id', { infer: true })
  }
}
