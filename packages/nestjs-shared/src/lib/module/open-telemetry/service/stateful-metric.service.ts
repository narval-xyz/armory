/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common'
import {
  Attributes,
  BatchObservableCallback,
  Context,
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

type MetricEvent = {
  name: string
  value: number
  options?: MetricOptions
  attributes?: Record<string, unknown>
  context?: Context
}

@Injectable()
export class StatefulMetricService implements MetricService {
  public counters: MetricEvent[] = []

  public histograms: MetricEvent[] = []

  public gauges: MetricEvent[] = []

  public upDownCounters: MetricEvent[] = []

  reset(): void {
    this.counters = []
    this.histograms = []
    this.gauges = []
    this.upDownCounters = []
  }

  getMeter(): Meter {
    return metrics.getMeter('test-meter')
  }

  createCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Counter<T> {
    const metric = this.getMeter().createCounter(name, options)

    return {
      add: (value: number, attributes?: T, context?: Context): void => {
        this.counters.push({
          name,
          value,
          options,
          attributes,
          context
        })

        return metric.add(value, attributes, context)
      }
    }
  }

  createHistogram<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Histogram<T> {
    const metric = this.getMeter().createHistogram(name, options)

    return {
      record: (value: number, attributes?: T, context?: Context): void => {
        this.histograms.push({
          name,
          value,
          options,
          attributes,
          context
        })

        return metric.record(value, attributes, context)
      }
    }
  }

  createGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): Gauge<T> {
    const metric = this.getMeter().createGauge(name, options)

    return {
      record: (value: number, attributes?: T, context?: Context): void => {
        this.gauges.push({
          name,
          options,
          value,
          attributes,
          context
        })

        return metric.record(value, attributes, context)
      }
    }
  }

  createUpDownCounter<T extends Attributes = Attributes>(name: string, options?: MetricOptions): UpDownCounter<T> {
    const metric = this.getMeter().createUpDownCounter(name, options)

    return {
      add: (value: number, attributes?: T, context?: Context): void => {
        this.upDownCounters.push({
          name,
          options,
          value,
          attributes,
          context
        })

        return metric.add(value, attributes, context)
      }
    }
  }

  createObservableGauge<T extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableGauge<T> {
    const metric = this.getMeter().createObservableGauge(name, options)

    // TODO: (@wcalderipe 30/10/24) Record observable gauge addCallback and
    // removeCallback into memory.
    //
    // CONGRATS! if you're here, it means you have been thinking about
    // observability AND how to test custom intrumentation.

    return metric
  }

  createObservableCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableCounter<T> {
    const metric = this.getMeter().createObservableCounter(name, options)

    // TODO: (@wcalderipe 30/10/24) Record observable counter addCallback and
    // removeCallback into memory.
    //
    // CONGRATS! if you're here, it means you have been thinking about
    // observability AND how to test custom intrumentation.

    return metric
  }

  createObservableUpDownCounter<T extends Attributes = Attributes>(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter<T> {
    const metric = this.getMeter().createObservableUpDownCounter(name, options)

    // TODO: (@wcalderipe 30/10/24) Record observable up/down counter
    // addCallback and removeCallback into memory.
    //
    // CONGRATS! if you're here, it means you have been thinking about
    // observability AND how to test custom intrumentation.

    return metric
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
