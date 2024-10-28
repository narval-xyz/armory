import { Inject, Injectable } from '@nestjs/common'
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
  UpDownCounter,
  metrics
} from '@opentelemetry/api'
import { OPEN_TELEMETRY_MODULE_OPTION } from '../open-telemetry.constant'
import { OpenTelemetryModuleOption } from '../open-telemetry.type'

@Injectable()
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
export class MetricService {
  constructor(@Inject(OPEN_TELEMETRY_MODULE_OPTION) private readonly config: OpenTelemetryModuleOption) {}

  public getMeter(): Meter {
    return metrics.getMeter(this.config.serviceName)
  }

  public createCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Counter<T> {
    return this.getMeter().createCounter(name, options)
  }

  public createHistogram<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Histogram<T> {
    return this.getMeter().createHistogram(name, options)
  }

  public createGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Gauge<T> {
    return this.getMeter().createGauge(name, options)
  }

  public createUpDownCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): UpDownCounter<T> {
    return this.getMeter().createUpDownCounter(name, options)
  }

  public createObservableGauge<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableGauge<T> {
    return this.getMeter().createObservableGauge(name, options)
  }

  public createObservableCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableCounter<T> {
    return this.getMeter().createObservableCounter(name, options)
  }

  public createObservableUpDownCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter<T> {
    return this.getMeter().createObservableUpDownCounter(name, options)
  }

  public addBatchObservableCallback<T extends Attributes = Attributes>(
    callback: BatchObservableCallback<T>,
    observables: Observable<T>[]
  ): void {
    this.getMeter().addBatchObservableCallback(callback, observables)
  }

  public removeBatchObservableCallback<T extends Attributes = Attributes>(
    callback: BatchObservableCallback<T>,
    observables: Observable<T>[]
  ): void {
    this.getMeter().removeBatchObservableCallback(callback, observables)
  }
}
