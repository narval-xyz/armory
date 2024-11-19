import { Attributes, Context, Span, SpanOptions, Tracer } from '@opentelemetry/api'

export const TraceService = Symbol('TraceService')

/**
 * OpenTelemetry Trace/Span Name Conventions
 *
 * Format: `<operation_type>.<entity>.<action>`
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
export interface TraceService {
  getTracer(): Tracer

  getSpan(context: Context): Span | undefined

  getActiveSpan(): Span | undefined

  startSpan(name: string, options?: SpanOptions, context?: Context): Span

  startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, fn: F): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, options: SpanOptions, fn: F): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>

  setAttributesOnActiveSpan(attributes: Attributes): Span | undefined
}
