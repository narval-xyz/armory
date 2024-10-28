import { ConfigurableModuleBuilder } from '@nestjs/common'
import { OpenTelemetryModuleOption } from './open-telemetry.type'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<OpenTelemetryModuleOption>().build()
