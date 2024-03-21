import { ConfigModuleOptions as NestConfigModuleOptions } from '@nestjs/config'

export type ConfigModuleOptions = NestConfigModuleOptions & {
  load: NestConfigModuleOptions['load']
}
