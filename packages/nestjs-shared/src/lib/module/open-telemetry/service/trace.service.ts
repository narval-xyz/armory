import { Inject, Injectable } from '@nestjs/common'
import { Context, Span, SpanOptions, context, trace } from '@opentelemetry/api'
import { OPEN_TELEMETRY_MODULE_OPTION } from '../open-telemetry.constant'
import { OpenTelemetryException } from '../open-telemetry.exception'
import { OpenTelemetryModuleOption } from '../open-telemetry.type'

@Injectable()
/**
 * OpenTelemetry Trace/Span Name Conventions
 *
 * Format: <operation_type>.<entity>.<action>
 *
 * Common Operation Types:
 * - http: Web operations
 * - db: Database operations
 * - rpc: Remote procedure calls
 * - messaging: Queue/pub-sub operations
 * - process: Business logic/processing
 *
 * Examples:
 * - http.server.request
 * - db.query.execute
 * - process.payment.validate
 * - auth.user.login
 * - file.document.upload
 * - cache.item.get
 *
 * Rules:
 * - Use dot.case notation
 * - Be specific but not overly granular
 * - Operation type should come first
 * - Action verb should be last
 * - Keep names stable/consistent
 *
 * @see https://opentelemetry.io/docs/specs/semconv/general/trace
 */
export class TraceService {
  constructor(@Inject(OPEN_TELEMETRY_MODULE_OPTION) private readonly config: OpenTelemetryModuleOption) {}

  public getTracer() {
    return trace.getTracer(this.config.serviceName)
  }

  public getSpan(context: Context): Span | undefined {
    return trace.getSpan(context)
  }

  public getActiveSpan(): Span | undefined {
    return this.getSpan(context.active())
  }

  public startSpan(name: string): Span {
    const tracer = this.getTracer()

    return tracer.startSpan(name)
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
}
