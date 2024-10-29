import {
  Attributes,
  BatchObservableCallback,
  Counter,
  Gauge,
  Histogram,
  Meter,
  MetricOptions,
  Observable,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter
} from '@opentelemetry/api'

export const MetricService = Symbol('MetricService')

/**
 * OpenTelemetry Metric Naming Conventions
 *
 * Format: <system>_<entity>_<unit>_<action>_<state>
 *
 * Unit Suffixes:
 * - _seconds: Duration measurements
 * - _bytes: Size measurements
 * - _count: Current counts (gauge)
 * - _total: Cumulative counts (counter)
 * - _ratio: Percentages/ratios
 *
 * Examples:
 * - http_requests_total
 * - http_request_duration_seconds
 * - db_connections_active_count
 * - memory_heap_bytes_used
 * - cache_hits_ratio
 * - queue_messages_processed_total
 * - user_sessions_active_count
 * - file_upload_bytes_total
 *
 * Rules:
 * - Use snake_case
 * - Always include unit in name
 * - Be explicit about aggregation type
 * - Keep names stable/consistent
 * - Start with system/subsystem
 *
 * @see https://opentelemetry.io/docs/specs/otel/metrics/semantic_conventions
 */
export interface MetricService {
  getMeter(): Meter

  createCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Counter<T>

  createHistogram<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Histogram<T>

  createGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Gauge<T>

  createUpDownCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): UpDownCounter<T>

  createObservableGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableGauge<T>

  createObservableCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableCounter<T>

  createObservableUpDownCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter<T>

  addBatchObservableCallback<T extends Attributes = Attributes>(
    callback: BatchObservableCallback<T>,
    observables: Observable<T>[]
  ): void

  removeBatchObservableCallback<T extends Attributes = Attributes>(
    callback: BatchObservableCallback<T>,
    observables: Observable<T>[]
  ): void
}
