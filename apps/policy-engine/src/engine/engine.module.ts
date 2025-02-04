import { ConfigService } from '@narval/config-module'
import { HttpModule } from '@narval/nestjs-shared'
import { Module, ValidationPipe } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { ClientModule } from '../client/client.module'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AppController } from './app.controller'
import { OpenPolicyAgentEngineFactory } from './core/factory/open-policy-agent-engine.factory'
import { signingServiceFactory } from './core/factory/signing-service.factory'
import { EngineService } from './core/service/engine.service'
import { EvaluationService } from './core/service/evaluation.service'
import { EvaluationController } from './http/rest/controller/evaluation.controller'
import { EngineRepository } from './persistence/repository/engine.repository'

@Module({
  imports: [HttpModule.register(), PersistenceModule, KeyValueModule, ClientModule],
  controllers: [AppController, EvaluationController],
  providers: [
    AdminApiKeyGuard,
    OpenPolicyAgentEngineFactory,
    EngineRepository,
    EngineService,
    EvaluationService,

    {
      provide: 'SigningService',
      useFactory: signingServiceFactory,
      inject: [ConfigService]
    },
    {
      // DEPRECATE: Use Zod generated DTOs to validate request and responses.
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    }
  ],
  exports: [EngineService]
})
export class EngineModule {}
