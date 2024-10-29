import { DynamicModule } from '@nestjs/common'
import { MetricService } from './service/metric.service'
import { OpenTelemetryMetricService } from './service/open-telemetry-metric.service'
import { OpenTelemetryTraceService } from './service/open-telemetry-trace.service'
import { StatefulMetricService } from './service/stateful-metric.service'
import { StatefulTraceService } from './service/stateful-trace.service'
import { TraceService } from './service/trace.service'

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
