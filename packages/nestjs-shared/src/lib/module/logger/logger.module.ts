import { DynamicModule, Module } from '@nestjs/common'
import { LoggerService } from './service/logger.service'
import { NullLoggerService } from './service/null-logger.service'

@Module({
  providers: [LoggerService],
  exports: [LoggerService]
})
export class LoggerModule {
  static forTest(): DynamicModule {
    return {
      module: LoggerModule,
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
