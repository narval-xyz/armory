import { stringify } from '@narval/policy-engine-shared'
import winston from 'winston'
import { redact } from './logger.util'

const isProduction = () => process.env.NODE_ENV === 'production'

const getLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return '\x1b[31m' // Red
    case 'warn':
      return '\x1b[33m' // Yellow
    case 'info':
      return '\x1b[36m' // Cyan
    case 'debug':
      return '\x1b[35m' // Magenta
    default:
      return '\x1b[0m' // Reset color
  }
}

const pretty = (info: winston.Logform.TransformableInfo) => {
  const { level, message, ...context } = info

  return `${info.timestamp} ${getLevelColor(level)}[${level.toUpperCase()}]\x1b[0m: ${message}\n${stringify(context, 2)}`
}

const redacting = winston.format((info) => {
  return redact(info)
})

const BASE_FORMAT = [winston.format.timestamp(), winston.format.json(), redacting()]

const production = winston.format.combine(...BASE_FORMAT, winston.format.printf(stringify))

const development = winston.format.combine(...BASE_FORMAT, winston.format.printf(pretty))

export const buildLogger = () =>
  winston.createLogger({
    exitOnError: false,
    transports: [new winston.transports.Console()],
    format: isProduction() ? production : development
  })

export const logger = buildLogger()
