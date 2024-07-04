import { LoggerService } from '@narval/nestjs-shared'
import { Inject, Injectable } from '@nestjs/common'
import { ModulesContainer } from '@nestjs/core'
import { SeedService } from './seed.service'

@Injectable()
export class SeederService {
  constructor(
    @Inject(ModulesContainer) private modulesContainer: ModulesContainer,
    private logger: LoggerService
  ) {}

  async seed() {
    for (const seed of this.getSeedServices()) {
      const name = seed.constructor.name

      this.logger.log(`Germinating ${name}`)

      let error: unknown | null = null
      try {
        await seed.germinate()
      } catch (err) {
        this.logger.error('Error while germinating ${name}')

        error = err
      }

      if (!error) {
        this.logger.log(`${name} germinated`)
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
