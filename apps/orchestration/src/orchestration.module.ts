import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PolicyEngineModule } from './policy-engine/policy-engine.module'

@Module({
  imports: [ConfigModule.forRoot(), PolicyEngineModule]
})
export class OrchestrationModule {}
