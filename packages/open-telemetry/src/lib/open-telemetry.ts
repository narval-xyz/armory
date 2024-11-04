/**
 * IMPORTANT: OpenTelemetry SDK registration is kept in a separate package
 * because:
 *
 * OpenTelemetry modifies Node.js runtime behavior by patching core modules. If
 * we import any dependencies before registering OpenTelemetry, those imports
 * will use the unpatched runtime and won't be instrumented correctly.
 *
 * Having it separate ensures OpenTelemetry is registered first, before any
 * other code runs, guaranteeing proper instrumentation of all dependencies.
 */

import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'

type OpenTelemetryOption = {
  serviceName: string
  diagLogLevel?: DiagLogLevel
}

export const buildOpenTelemetrySdk = ({ serviceName, diagLogLevel }: OpenTelemetryOption) => {
  if (diagLogLevel) {
    diag.setLogger(new DiagConsoleLogger(), diagLogLevel)
  }

  return new NodeSDK({
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
    instrumentations: [...getNodeAutoInstrumentations(), new PrismaInstrumentation()]
  })
}

export const instrumentOpenTelemetry = (options: OpenTelemetryOption): void => {
  const sdk = buildOpenTelemetrySdk(options)

  sdk.start()

  const handleShutdown = async () => {
    // Flush traces and metrics to the API before shutdown.
    await sdk.shutdown()
  }

  process.on('SIGTERM', handleShutdown)
  process.on('SIGINT', handleShutdown)
}
