import { ConfigService } from '@narval/config-module'
import { LoggerService, secret } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../armory.config'
import { AppRepository } from '../../persistence/repository/app.repository'
import { AlreadyActivatedException } from '../exception/app-already-activated.exception'
import { ProvisionException } from '../exception/provision.exception'
import { App } from '../type/app.type'

@Injectable()
export class AppService {
  constructor(
    private appRepository: AppRepository,
    private configService: ConfigService<Config>,
    private logger: LoggerService
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

  async provision(adminApiKeyHash?: string): Promise<App> {
    this.logger.log('Start app provision')

    const app = await this.getApp()

    const isNotProvisioned = !app || !app.adminApiKey

    if (isNotProvisioned) {
      this.logger.log('Saving app on first boot')

      const provisionedApp: App = app || {
        id: this.getId()
      }

      const apiKey = adminApiKeyHash || this.getAdminApiKeyHash()

      if (apiKey) {
        this.logger.log('API key detected')

        return this.save({
          ...provisionedApp,
          adminApiKey: apiKey
        })
      }

      return this.save(provisionedApp)
    }

    this.logger.log('App already provisioned')

    return app
  }

  async activate(adminApiKey: string): Promise<App> {
    const app = await this.getOrProvision()

    if (this.isActivated(app)) {
      throw new AlreadyActivatedException()
    }

    await this.appRepository.update({
      ...app,
      adminApiKey: secret.hash(adminApiKey)
    })

    return { ...app, adminApiKey }
  }

  private async getOrProvision() {
    const app = await this.getApp()

    if (app) {
      return app
    }

    return this.provision()
  }

  private isActivated(app: App): boolean {
    return Boolean(app.adminApiKey)
  }

  private getAdminApiKeyHash(): string | undefined {
    return this.configService.get('app.adminApiKeyHash')
  }

  private getId(): string {
    return this.configService.get('app.id')
  }
}
