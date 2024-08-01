import { INestApplication } from '@nestjs/common'
import { cloneDeep } from 'lodash'
import traverse, { clone } from 'traverse'
import { REDACT_KEYS, REDACT_REPLACE } from './logger.constant'
import { LoggerService } from './service/logger.service'

const isSensitiveKey = (key?: string): boolean => {
  if (key) {
    return REDACT_KEYS.some((regex) => regex.test(key))
  }

  return false
}

export const redact = <T>(input: T): T => {
  const copy = cloneDeep(input)

  return traverse(copy).forEach(function redactor() {
    // Prevents a mutation in the original input when the value is a class
    // extending Error.
    if (this.node instanceof Error) {
      this.update(clone(this.node))
    }

    if (isSensitiveKey(this.key)) {
      this.update(REDACT_REPLACE)
    }
  })
}

/**
 * Adds custom logger to the application
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
export const withLogger = (app: INestApplication): INestApplication => {
  app.useLogger(app.get(LoggerService))

  return app
}
