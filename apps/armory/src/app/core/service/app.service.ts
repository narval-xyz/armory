import { ConfigService } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../../../armory.config'
import { AppRepository } from '../../persistence/repository/app.repository'
import { ProvisionException } from '../exception/provision.exception'
import { App } from '../type/app.type'

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name)

  constructor(
    private appRepository: AppRepository,
    private configService: ConfigService<Config>
  ) {}

  async getAppOrThrow(): Promise<App> {
    const app = await this.getApp()

    if (app) {
      return app
    }

    throw new ProvisionException('App not provisioned')
  }

  async getApp(): Promise<App | null> {
    return this.appRepository.findById(this.getId())
  }

  async save(app: App): Promise<App> {
    return this.appRepository.save(app)
  }

  async provision(): Promise<App> {
    const app = await this.getApp()

    const isFirstBoot = app === null

    if (isFirstBoot) {
      this.logger.log('Start app provision')

      const provisionedApp: App = {
        id: this.getId()
      }

      const adminApiKey = this.getAdminApiKey()

      if (adminApiKey) {
        const activatedApp: App = {
          ...provisionedApp,
          adminApiKey
        }

        await this.save({
          ...activatedApp,
          adminApiKey: secret.hash(adminApiKey)
        })

        return activatedApp
      }

      return this.save(provisionedApp)
    }

    this.logger.log('App already provisioned')

    return app
  }

  async activate(adminApiKey: string): Promise<{ isActivated: true } | { isActivated: false; app: App }> {
    const app = await this.getOrProvision()

    if (this.isProvisioned(app)) {
      return { isActivated: true }
    }

    await this.appRepository.update({
      ...app,
      adminApiKey: secret.hash(adminApiKey)
    })

    return {
      isActivated: false,
      app: { ...app, adminApiKey }
    }
  }

  private async getOrProvision() {
    const app = await this.getApp()

    if (app) {
      return app
    }

    return this.provision()
  }

  isProvisioned(app: App): boolean {
    return Boolean(app.adminApiKey)
  }

  private getAdminApiKey(): string | undefined {
    return this.configService.get('app.adminApiKey')
  }

  private getId(): string {
    return this.configService.get('app.id')
  }
}
