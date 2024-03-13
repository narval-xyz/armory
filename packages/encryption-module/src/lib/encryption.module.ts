import { Module } from '@nestjs/common'
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './encryption.module-definition'
import { EncryptionService } from './encryption.service'

export const EncryptionModuleOptionProvider = MODULE_OPTIONS_TOKEN

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService]
})
export class EncryptionModule extends ConfigurableModuleClass {}
