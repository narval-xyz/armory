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

import { DiagLogLevel } from '@opentelemetry/api'
import { InstrumentationConfigMap, getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { IncomingMessage } from 'http'

type OpenTelemetryOption = {
  serviceName: string
  diagLogLevel?: DiagLogLevel
  instrumentations?: InstrumentationConfigMap
}

export const ignoreIncomingRequestHook = (req: IncomingMessage): boolean => {
  const basePath = req.url?.split(/[?&]/)[0] || ''
  // These URL paths are part of each NestJS application and used to determine
  // if the server is running.
  const ignorePaths = ['/', '/ping']

  return ignorePaths.includes(basePath)
}

const getInstrumentations = (instrumentations?: InstrumentationConfigMap) => {
  return getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
    '@opentelemetry/instrumentation-http': {
      enabled: true,
      ignoreIncomingRequestHook
    },
    '@opentelemetry/instrumentation-winston': { enabled: true },
    '@opentelemetry/instrumentation-net': { enabled: true },
    '@opentelemetry/instrumentation-express': { enabled: true },
    '@opentelemetry/instrumentation-dns': { enabled: true },

    // Disable irrelevant instrumentations.
    '@opentelemetry/instrumentation-ioredis': { enabled: false },
    '@opentelemetry/instrumentation-aws-sdk': { enabled: false },
    '@opentelemetry/instrumentation-aws-lambda': { enabled: false },
    '@opentelemetry/instrumentation-bunyan': { enabled: false },
    '@opentelemetry/instrumentation-connect': { enabled: false },
    '@opentelemetry/instrumentation-cucumber': { enabled: false },
    '@opentelemetry/instrumentation-dataloader': { enabled: false },
    '@opentelemetry/instrumentation-fastify': { enabled: false },
    '@opentelemetry/instrumentation-fs': { enabled: false },
    '@opentelemetry/instrumentation-generic-pool': { enabled: false },
    '@opentelemetry/instrumentation-graphql': { enabled: false },
    '@opentelemetry/instrumentation-grpc': { enabled: false },
    '@opentelemetry/instrumentation-hapi': { enabled: false },
    '@opentelemetry/instrumentation-kafkajs': { enabled: false },
    '@opentelemetry/instrumentation-knex': { enabled: false },
    '@opentelemetry/instrumentation-koa': { enabled: false },
    '@opentelemetry/instrumentation-lru-memoizer': { enabled: false },
    '@opentelemetry/instrumentation-memcached': { enabled: false },
    '@opentelemetry/instrumentation-mongodb': { enabled: false },
    '@opentelemetry/instrumentation-mysql': { enabled: false },
    '@opentelemetry/instrumentation-mysql2': { enabled: false },
    '@opentelemetry/instrumentation-pg': { enabled: false },
    '@opentelemetry/instrumentation-pino': { enabled: false },
    '@opentelemetry/instrumentation-redis': { enabled: false },
    '@opentelemetry/instrumentation-redis-4': { enabled: false },
    '@opentelemetry/instrumentation-restify': { enabled: false },
    '@opentelemetry/instrumentation-router': { enabled: false },
    '@opentelemetry/instrumentation-socket.io': { enabled: false },
    '@opentelemetry/instrumentation-tedious': { enabled: false },
    '@opentelemetry/instrumentation-undici': { enabled: false },

    // Customer override.
    ...instrumentations
  })
}

export const buildOpenTelemetrySdk = ({ serviceName, instrumentations }: OpenTelemetryOption) => {
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
    instrumentations: [getInstrumentations(instrumentations)]
  })
}

const registerGracefulShutdownHandler = ({ sdk, event }: { sdk: NodeSDK; event: 'SIGTERM' | 'SIGINT' }): void => {
  process.on(event, async () => {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message: `Shutdown OpenTelemetry on ${event}`
      })
    )

    // Flush traces and metrics to the API before shutdown.
    await sdk.shutdown()
  })
}

export const instrumentTelemetry = (options: OpenTelemetryOption): void => {
  const sdk = buildOpenTelemetrySdk(options)

  sdk.start()

  registerGracefulShutdownHandler({ sdk, event: 'SIGTERM' })
  registerGracefulShutdownHandler({ sdk, event: 'SIGINT' })
}
