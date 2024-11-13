import { Injectable } from '@nestjs/common'
import { Attributes, Context, Span, SpanOptions, Tracer, context, trace } from '@opentelemetry/api'
import { ReadableSpan } from '@opentelemetry/sdk-trace-node'
import { OpenTelemetryException } from '../open-telemetry.exception'
import { TraceService } from './trace.service'

@Injectable()
export class StatefulTraceService implements TraceService {
  public spans: ReadableSpan[] = []

  reset(): void {
    this.spans = []
  }

  getTracer(): Tracer {
    return trace.getTracer('test-tracer')
  }

  getSpan(context: Context): Span | undefined {
    return trace.getSpan(context)
  }

  getActiveSpan(): Span | undefined {
    return this.getSpan(context.active())
  }

  public startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    const tracer = this.getTracer()
    const span = tracer.startSpan(name, options, context)

    this.spans.push(span as unknown as ReadableSpan)

    return span
  }

  startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, fn: F): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, options: SpanOptions, fn: F): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    optionsOrFnOrContext?: SpanOptions | F | Context,
    fnOrContextOrNothing?: F | Context | undefined,
    fnOrNothing?: F | undefined
  ): ReturnType<F> {
    let fn: F
    let options: SpanOptions | undefined
    let context: Context | undefined

    if (typeof optionsOrFnOrContext === 'function') {
      fn = optionsOrFnOrContext
    } else if (typeof fnOrContextOrNothing === 'function') {
      options = optionsOrFnOrContext as SpanOptions
      fn = fnOrContextOrNothing
    } else if (fnOrNothing) {
      options = optionsOrFnOrContext as SpanOptions
      context = fnOrContextOrNothing as Context
      fn = fnOrNothing
    } else {
      throw new OpenTelemetryException('Invalid arguments provided to startActiveSpan')
    }

    const span = this.startSpan(name, options, context)

    return fn(span)
  }

  public setAttributesOnActiveSpan(attributes: Attributes): Span | undefined {
    const span = this.getActiveSpan()

    if (span) {
      span.setAttributes(attributes)
    }

    return span
  }
}
