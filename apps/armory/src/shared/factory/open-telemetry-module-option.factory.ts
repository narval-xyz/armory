import { ConfigService } from '@narval/config-module'
import { LoggerService, OpenTelemetryModuleOption } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { Config } from '../../armory.config'

@Injectable()
export class OpenTelemetryModuleOptionFactory {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService<Config>
  ) {}

  async create(): Promise<OpenTelemetryModuleOption> {
    const metricExporterUrl = this.configService.get('openTelemetry.metricExporterUrl')
    const traceExporterUrl = this.configService.get('openTelemetry.traceExporterUrl')

    const isEnabled = Boolean(metricExporterUrl && traceExporterUrl)

    if (isEnabled) {
      this.loggerService.log('OpenTelemetry module enabled', {
        metricExporterUrl,
        traceExporterUrl
      })
    } else {
      this.loggerService.warn('OpenTelemetry module disabled', {
        metricExporterUrl,
        traceExporterUrl
      })
    }

    return {
      serviceName: 'armory',
      isEnabled,
      traceExporter: new OTLPTraceExporter({
        url: traceExporterUrl
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: metricExporterUrl,
          concurrencyLimit: 1
        })
      }),
      instrumentations: [getNodeAutoInstrumentations()]
    }
  }
}
