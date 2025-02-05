import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Inject, Injectable } from '@nestjs/common'
import { ModulesContainer } from '@nestjs/core'
import { Config, Env } from '../../../../main.config'
import { SeedService } from './seed.service'

@Injectable()
export class SeederService {
  constructor(
    @Inject(ModulesContainer) private modulesContainer: ModulesContainer,
    private configService: ConfigService<Config>,
    private logger: LoggerService
  ) {}

  async seed() {
    if (this.configService.get('env') === Env.PRODUCTION) {
      throw new Error('Cannot seed production database!')
    }

    for (const service of this.getSeedServices()) {
      const name = service.constructor.name

      this.logger.log(`🌱 Seeding ${name}`)

      let error: unknown | null = null
      try {
        await service.seed()
      } catch (err) {
        this.logger.error(`❌ Error while seeding ${name}`, err)

        error = err
      }

      if (!error) {
        this.logger.log(`✅ ${name} seeded`)
      }
    }
  }

  private getSeedServices(): SeedService[] {
    return Array.from(this.modulesContainer.values())
      .flatMap((module) => Array.from(module.providers.values()))
      .map((provider) => provider.instance)
      .filter((instance): instance is SeedService => instance instanceof SeedService)
  }
}
