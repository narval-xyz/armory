import { BeforeApplicationShutdown, DynamicModule, Injectable } from '@nestjs/common'
import { InMemoryMetricExporter } from '@opentelemetry/sdk-metrics'
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base'
import { MetricService } from './service/metric.service'
import { OpenTelemetryMetricService } from './service/open-telemetry-metric.service'
import { OpenTelemetryTraceService } from './service/open-telemetry-trace.service'
import { StatefulMetricService } from './service/stateful-metric.service'
import { StatefulTraceService } from './service/stateful-trace.service'
import { TraceService } from './service/trace.service'

export const OpenTelemetryTestResource = Symbol('OpenTelemetryTestResource')

@Injectable()
class TestTeardownService implements BeforeApplicationShutdown {
  constructor(
    private inMemoryMetricExporter: InMemoryMetricExporter,
    private inMemorySpanExporter: InMemorySpanExporter
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async beforeApplicationShutdown(_signal?: string | undefined) {
    await this.inMemoryMetricExporter.shutdown()
    await this.inMemorySpanExporter.shutdown()
  }
}

export class OpenTelemetryModule {
  static forRoot(): DynamicModule {
    return {
      module: OpenTelemetryModule,
      global: true,
      providers: [
        OpenTelemetryMetricService,
        OpenTelemetryTraceService,
        {
          provide: TraceService,
          useExisting: OpenTelemetryTraceService
        },
        {
          provide: MetricService,
          useExisting: OpenTelemetryMetricService
        }
      ],
      exports: [MetricService, TraceService, OpenTelemetryMetricService, OpenTelemetryTraceService]
    }
  }

  /**
   * The test module creates and adds to the dependency injection container an
   * InMemoryMetricExporter and Resource. Useful to collect and keep metrics in
   * state instead of sending to a backend.
   *
   * Usage in tests:
   *
   * ```typescript
   * describe('Test', () => {
   *   let inMemoryMetricExporter: InMemoryMetricExporter
   *   let inMemorySpanExporter: InMemorySpanExporter
   *   let testResource: Resource
   *
   *   beforeEach(async () => {
   *     // Get instances from NestJS DI container
   *     inMemoryMetricExporter = module.get(InMemoryMetricExporter)
   *     inMemorySpanExporter = module.get(InMemorySpanExporter)
   *     testResource = module.get<Resource>(OpenTelemetryTestResource)
   *   });
   *
   *   it('collects spans and metrics', async () => {
   *     const metrics = inMemoryMetricExporter.getMetrics();
   *
   *     // OR Callback approach - useful for testing export completion
   *     inMemoryMetricExporter.export(metrics, result => {
   *       // Handle export completion
   *       done();
   *     });
   *   });
   * });
   * ```
   *
   * @see https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/sdk-metrics/test/export/InMemoryMetricExporter.test.ts
   * @see https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-base/test/common/export/InMemorySpanExporter.test.ts
   */
  static forTest(): DynamicModule {
    const module = this.forRoot()

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
