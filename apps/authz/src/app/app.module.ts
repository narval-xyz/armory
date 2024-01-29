import { OrganizationRepository } from '@app/authz/app/persistence/repository/organization.repository'
import { PersistenceModule } from '@app/authz/shared/module/persistence/persistence.module'
import { Logger, Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OpaService } from './opa/opa.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    PersistenceModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OrganizationRepository,
    OpaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule implements OnApplicationBootstrap {
  private logger = new Logger(AppModule.name)

  constructor(private opaService: OpaService) {}

  async onApplicationBootstrap() {
    this.logger.log('Armory Engine app module boot')

    await this.opaService.onApplicationBootstrap()
  }
}
