export class NarvalSdkException extends Error {
  context: Record<string, unknown>
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message)
    this.name = 'NarvalSdkException'
    this.context = context
  }
}

export class ConfigurationException extends NarvalSdkException {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
    this.name = ConfigurationException.name
  }
}

export class ForbiddenException extends NarvalSdkException {
  code: number

  constructor(message: string, context: Record<string, unknown> = {}, suggestedHttpCode = 403) {
    super(message, context)
    this.code = suggestedHttpCode
    this.name = ForbiddenException.name
  }
}

export class NotImplementedException extends NarvalSdkException {
  code: number

  constructor(message: string, context: Record<string, unknown> = {}, suggestedHttpCode = 501) {
    super(message, context)
    this.code = suggestedHttpCode
    this.name = 'NotImplementedError'
  }
}
