export class ArmorySdkException extends Error {
  context: Record<string, unknown>

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message)
    this.name = ArmorySdkException.name
    this.context = context
  }
}

export class ConfigurationException extends ArmorySdkException {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
    this.name = ConfigurationException.name
  }
}

export class ForbiddenException extends ArmorySdkException {
  code: number

  constructor(message: string, context: Record<string, unknown> = {}, suggestedHttpCode = 403) {
    super(message, context)
    this.code = suggestedHttpCode
    this.name = ForbiddenException.name
  }
}

export class NotImplementedException extends ArmorySdkException {
  code: number

  constructor(message: string, context: Record<string, unknown> = {}, suggestedHttpCode = 501) {
    super(message, context)
    this.code = suggestedHttpCode
    this.name = 'NotImplementedError'
  }
}
