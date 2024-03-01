export class JwtError extends Error {
  readonly context?: Record<string, unknown>

  constructor({ context, message }: { context?: Record<string, unknown>; message: string }) {
    super(message)

    this.context = context
  }
}
