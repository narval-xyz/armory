export class TransactionRequestIntentError extends Error {
  readonly context?: any

  readonly status: number

  constructor({ context, message, status }: { context?: any; message: string; status: number }) {
    super(message)

    this.status = status
    this.context = context
  }
}
