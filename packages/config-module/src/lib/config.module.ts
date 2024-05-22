/* eslint-disable no-restricted-imports */
import { DynamicModule } from '@nestjs/common'
// eslint-disable-next-line no-restricted-imports
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { ConfigService } from './config.service'
import { ConfigModuleOptions } from './config.type'

export class ConfigModule {
  static forRoot(options?: ConfigModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      global: options?.isGlobal ?? false,
      imports: [
        NestConfigModule.forRoot({
          ...options,
          // See https://docs.nestjs.com/techniques/configuration#expandable-variables
          expandVariables: true
        })
      ],
      providers: [ConfigService],
      exports: [ConfigService]
    }
  }
}
