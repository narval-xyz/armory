export class DecoderError extends Error {
  readonly context?: Record<string, unknown>

  readonly status: number

  constructor({ context, message, status }: { context?: Record<string, unknown>; message: string; status: number }) {
    super(message)

    this.status = status
    this.context = context
  }
}
