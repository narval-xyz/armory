import { DynamicModule, Global, Module } from '@nestjs/common'
import { LoggerService } from './service/logger.service'
import { NullLoggerService } from './service/null-logger.service'

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService]
})
export class LoggerModule {
  static forTest(): DynamicModule {
    return {
      module: LoggerModule,
      global: true,
      providers: [
        {
          provide: LoggerService,
          useClass: NullLoggerService
        }
      ],
      exports: [LoggerService]
    }
  }
}
