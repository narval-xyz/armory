import { Injectable } from '@nestjs/common'
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
import { MetricService } from './metric.service'

@Injectable()
export class OpenTelemetryMetricService implements MetricService {
  public getMeter(): Meter {
    return metrics.getMeter('default')
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
