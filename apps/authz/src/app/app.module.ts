import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PersistenceModule } from '@app/authz/shared/module/persistence/persistence.module'
import { load } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OpaService } from './opa/opa.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load]
    }),
    PersistenceModule
  ],
  controllers: [AppController],
  providers: [AppService, OpaService]
})
export class AppModule implements OnApplicationBootstrap {
  private logger = new Logger(AppModule.name)

  constructor(private opaService: OpaService) {}

  async onApplicationBootstrap() {
    this.logger.log('Armory Engine app module boot')

    await this.opaService.onApplicationBootstrap()
  }
}
