import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FacadeController } from './controllers/facade.controller'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FacadeController]
})
export class PolicyEngineModule {}
