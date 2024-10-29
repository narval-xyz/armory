/* eslint-disable @typescript-eslint/no-unused-vars */

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
export class StatefulMetricService implements MetricService {
  public counters: Counter[] = []

  public histograms: Histogram[] = []

  public gauges: Gauge[] = []

  public upDownCounters: UpDownCounter[] = []

  public observableGauges: ObservableGauge[] = []

  public observableCounters: ObservableCounter[] = []

  public observableUpDownCounters: ObservableUpDownCounter[] = []

  reset(): void {
    this.counters = []
    this.histograms = []
    this.gauges = []
    this.upDownCounters = []
    this.observableGauges = []
    this.observableCounters = []
    this.observableUpDownCounters = []
  }

  getMeter(): Meter {
    return metrics.getMeter('test-meter')
  }

  createCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Counter<T> {
    const counter = this.getMeter().createCounter(name, options)
    this.counters.push(counter)
    return counter
  }

  createHistogram<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Histogram<T> {
    const histogram = this.getMeter().createHistogram(name, options)
    this.histograms.push(histogram)
    return histogram
  }

  createGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Gauge<T> {
    const gauge = this.getMeter().createGauge(name, options)
    this.gauges.push(gauge)
    return gauge
  }

  createUpDownCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): UpDownCounter<T> {
    const upDownCounter = this.getMeter().createUpDownCounter(name, options)
    this.upDownCounters.push(upDownCounter)
    return upDownCounter
  }

  createObservableGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableGauge<T> {
    const observableGauge = this.getMeter().createObservableGauge(name, options)
    this.observableGauges.push(observableGauge)
    return observableGauge
  }

  createObservableCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableCounter<T> {
    const observableCounter = this.getMeter().createObservableCounter(name, options)
    this.observableCounters.push(observableCounter)
    return observableCounter
  }

  createObservableUpDownCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter<T> {
    const observableUpDownCounter = this.getMeter().createObservableUpDownCounter(name, options)
    this.observableUpDownCounters.push(observableUpDownCounter)
    return observableUpDownCounter
  }

  addBatchObservableCallback<T extends Attributes = Attributes>(
    _callback: BatchObservableCallback<T>,
    _observables: Observable<T>[]
  ): void {
    // No-op for testing
  }

  removeBatchObservableCallback<T extends Attributes = Attributes>(
    _callback: BatchObservableCallback<T>,
    _observables: Observable<T>[]
  ): void {
    // No-op for testing
  }
}
