import { DynamicModule, Inject, Module } from '@nestjs/common'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { OPEN_TELEMETRY_SDK } from './open-telemetry.constant'
import { OpenTelemetryException } from './open-telemetry.exception'
import { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, OPTIONS_TYPE } from './open-telemetry.module-definition'
import { OpenTelemetryModuleOption } from './open-telemetry.type'
import { MetricService } from './service/metric.service'
import { OpenTelemetryMetricService } from './service/open-telemetry-metric.service'
import { OpenTelemetryTraceService } from './service/open-telemetry-trace.service'
import { StatefulMetricService } from './service/stateful-metric.service'
import { StatefulTraceService } from './service/stateful-trace.service'
import { TraceService } from './service/trace.service'

@Module({
  providers: [
    {
      provide: TraceService,
      useClass: OpenTelemetryTraceService
    },
    {
      provide: MetricService,
      useClass: OpenTelemetryMetricService
    }
  ],
  exports: [TraceService, MetricService]
})
export class OpenTelemetryModule extends ConfigurableModuleClass {
  constructor(@Inject(OPEN_TELEMETRY_SDK) private readonly sdk: NodeSDK) {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async beforeApplicationShutdown(_signal?: string | undefined) {
    // Gracefully shutdown the SDK to flush data to the collector.
    await this.sdk.shutdown()
  }

  private static buildSdk(options: OpenTelemetryModuleOption): NodeSDK {
    return new NodeSDK({
      ...options,
      resource: new Resource({
        [ATTR_SERVICE_NAME]: options.serviceName
      })
    })
  }

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const module = super.register(options)

    const sdk = this.buildSdk(options)

    if (options.isEnabled) {
      sdk.start()
    }

    return {
      ...module,
      global: true,
      providers: [
        ...(module.providers || []),
        {
          provide: OPEN_TELEMETRY_SDK,
          useValue: sdk
        }
      ]
    }
  }

  private static async buildSdkAsync(
    options: typeof ASYNC_OPTIONS_TYPE,
    args: unknown[]
  ): Promise<[NodeSDK, OpenTelemetryModuleOption]> {
    if (options.useFactory) {
      const opts = await options.useFactory(...args)
      const sdk = this.buildSdk(opts)

      return [sdk, opts]
    }

    // Support custom options factory class.
    // See https://docs.nestjs.com/fundamentals/dynamic-modules#custom-options-factory-class
    if (options.useClass) {
      const factory = new options.useClass(...args)
      const opts = await factory.create()
      const sdk = this.buildSdk(opts)

      return [sdk, opts]
    }

    throw new OpenTelemetryException('Invalid arguments provided to registerAsync')
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const module = super.registerAsync(options)

    return {
      ...module,
      global: true,
      providers: [
        ...(module.providers || []),
        {
          provide: OPEN_TELEMETRY_SDK,
          inject: options.inject || [],
          useFactory: async (...args) => {
            const [sdk, opts] = await this.buildSdkAsync(options, args)

            if (opts.isEnabled) {
              sdk.start()
            }

            return sdk
          }
        }
      ]
    }
  }

  static registerTest(): DynamicModule {
    const module = this.register({
      serviceName: 'test-service',
      isEnabled: false
    })

    return {
      ...module,
      providers: [
        ...(module.providers || []),
        {
          provide: TraceService,
          useClass: StatefulTraceService
        },
        {
          provide: MetricService,
          useClass: StatefulMetricService
        }
      ]
    }
  }
}
