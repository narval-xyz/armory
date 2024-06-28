import { stringify } from '@narval/policy-engine-shared'
import { isUndefined, omit, omitBy } from 'lodash/fp'
import * as winston from 'winston'

const isProduction = process.env.NODE_ENV === 'production'

const omitUndefined = omitBy(isUndefined)

const cleanDetails = (info: winston.Logform.TransformableInfo) => {
  const details = omit(['mnemonic', 'privateKey'], info)

  if (details.wallets) {
    details.wallets = details.wallets.map(omit(['mnemonic', 'privateKey']))
  }

  if (details.request) {
    details.request = {
      method: details.request.method,
      url: details.request.url,
      body: details.request.body
    }
  }

  if (details.response?.header) {
    details.response = {
      status: details.response.status,
      message: details.response.message
    }
  }

  if (details.error) {
    details.error = omitUndefined({
      name: details.error.name,
      message: details.error.message,
      stack: details.error.stack,
      cause: details.error.cause,
      code: details.error.code,
      reason: details.error.reason,
      raw: details.error.toString()
    })
  }

  return details
}

const formatLocalLog = (info: winston.Logform.TransformableInfo) => {
  const details = cleanDetails(info)

  // Locally, just use debug and don't print the large context-related data
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query,
    message,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body,
    ...rest
  } = details

  // Colorize the level based on its value
  let levelColor = ''
  switch (info.level) {
    case 'error':
      levelColor = '\x1b[31m' // Red
      break
    case 'warn':
      levelColor = '\x1b[33m' // Yellow
      break
    case 'info':
      levelColor = '\x1b[36m' // Cyan
      break
    case 'debug':
      levelColor = '\x1b[35m' // Magenta
      break
    default:
      levelColor = '\x1b[0m' // Reset color
  }

  return `${info.timestamp} [${info.context}] ${levelColor}${info.level.toUpperCase()}\x1b[0m: ${message}${rest ? `\n${stringify(rest, 2)}` : ''}`
}

export const logger = winston.createLogger({
  exitOnError: false,
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => {
      console.log({ info })
      if (!isProduction) {
        return formatLocalLog(info)
      }

      const details = cleanDetails(info)

      return stringify({
        level: info.level,
        context: info.context,
        ...details
      })
    })
  )
})
