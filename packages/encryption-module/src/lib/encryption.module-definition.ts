import { ConfigurableModuleBuilder } from '@nestjs/common'
import { EncryptionModuleOption } from './encryption.type'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<EncryptionModuleOption>()
  .setFactoryMethodName('create')
  .build()
