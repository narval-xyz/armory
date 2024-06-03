import { ConfigurableModuleBuilder, NestMiddleware } from '@nestjs/common'

export type QueueModuleOption = {
  dashboard?: {
    auth?: NestMiddleware
  }
}

export const { ConfigurableModuleClass: QueueModuleDefinition, MODULE_OPTIONS_TOKEN: QUEUE_MODULE_OPTION_TOKEN } =
  new ConfigurableModuleBuilder<QueueModuleOption>().build()
