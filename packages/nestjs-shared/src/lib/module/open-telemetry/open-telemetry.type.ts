import { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
import { SetRequired } from 'type-fest'

/**
 * We enforce `serviceName` to follow OpenTelemetry best practices by using
 * meaningful service identifiers, maintaining distributed tracing standards,
 * and ensuring proper observability platform integration.
 *
 * The `isEnabled` option controls whether OpenTelemetry SDK will be
 * initialized. This is important for privacy compliance on self-hosted by
 * allowing users to opt-out of metrics collection.
 *
 * When disabled, the module will still be registered but it won't call `start`
 * in the SDK thus never collecting or exporting telemetry data.
 */
export type OpenTelemetryModuleOption = SetRequired<Partial<NodeSDKConfiguration>, 'serviceName'> & {
  isEnabled: boolean
}
