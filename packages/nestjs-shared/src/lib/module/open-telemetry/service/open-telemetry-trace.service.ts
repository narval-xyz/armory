import { Injectable } from '@nestjs/common'
import { Attributes, Context, Span, SpanOptions, Tracer, context, trace } from '@opentelemetry/api'
import { OpenTelemetryException } from '../open-telemetry.exception'
import { TraceService } from './trace.service'

@Injectable()
export class OpenTelemetryTraceService implements TraceService {
  public getTracer(): Tracer {
    return trace.getTracer('default')
  }

  public getSpan(context: Context): Span | undefined {
    return trace.getSpan(context)
  }

  public getActiveSpan(): Span | undefined {
    return this.getSpan(context.active())
  }

  public startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    const tracer = this.getTracer()

    return tracer.startSpan(name, options, context)
  }

  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, fn: F): ReturnType<F>
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: SpanOptions,
    fn: F
  ): ReturnType<F>
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    optionsOrFnOrContext?: SpanOptions | F | Context,
    fnOrContextOrNothing?: F | Context | undefined,
    fnOrNothing?: F | undefined
  ): ReturnType<F> {
    const tracer = this.getTracer()

    if (typeof optionsOrFnOrContext === 'function') {
      return tracer.startActiveSpan(name, optionsOrFnOrContext)
    }

    if (typeof fnOrContextOrNothing === 'function') {
      return tracer.startActiveSpan(name, optionsOrFnOrContext as SpanOptions, fnOrContextOrNothing)
    }

    if (fnOrNothing) {
      return tracer.startActiveSpan(
        name,
        optionsOrFnOrContext as SpanOptions,
        fnOrContextOrNothing as Context,
        fnOrNothing
      )
    }

    throw new OpenTelemetryException('Invalid arguments provided to startActiveSpan')
  }

  public setAttributesOnActiveSpan(attributes: Attributes): Span | undefined {
    const span = this.getActiveSpan()

    if (span) {
      span.setAttributes(attributes)
    }

    return span
  }
}
