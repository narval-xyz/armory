import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

export const buildOpenTelemetrySdk = ({ serviceName }: { serviceName: string }) => {
  const sdk = new NodeSDK({
    serviceName,
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName
    }),
    // Add composite propagator with W3C Trace Context and W3C Baggage to
    // pass the context from one distributed process to another.
    //
    // See https://opentelemetry.io/docs/specs/otel/context/api-propagators/#textmap-propagator
    textMapPropagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator(), new JaegerPropagator()]
    }),
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter()
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  })

  process.on('SIGTERM', async () => {
    // Flush traces and metrics to the API before shutdown.
    await sdk.shutdown()
  })

  return sdk
}
