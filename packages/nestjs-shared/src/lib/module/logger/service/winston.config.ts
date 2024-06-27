import { isUndefined, omit, omitBy } from 'lodash/fp'
import * as winston from 'winston'

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

const omitUndefined = omitBy(isUndefined)

const stringifyJsonWithBigInt = (json: any, space?: number) => {
  return JSON.stringify(json, (key, value) => (typeof value === 'bigint' ? `bigint:${value.toString()}` : value), space)
}

const cleanDetails = (info: winston.Logform.TransformableInfo) => {
  const details = omit(
    [
      'mnemonic',
      'remoteMnemonic',
      'privateKey',
      'wallet.mnemonic',
      'wallet.privateKey',
      'assetAndWallet.wallet.mnemonic',
      'assetAndWallet.wallet.privateKey',
      'assetAndWallet.borrowerWallet.mnemonic',
      'assetAndWallet.borrowerWallet.privateKey',
      'borrowerWallet.mnemonic',
      'borrowerWallet.privateKey',
      'tokenBalanceOnChainTransferArgs.fromMnemonic'
    ],
    info
  )

  // If we have a wallets array, strip out mnemonic
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

  // Format error details
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

  // Format Transaction details if needed
  if (details.transaction) {
    Object.entries(details.transaction).forEach(([key, value]) => {
      if (typeof value === 'bigint') {
        details.transaction[key] = value.toString()
      }
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

  return `${info.timestamp} ${levelColor}[${info?.level?.toUpperCase()}]\x1b[0m: ${
    info.message
  }\n${stringifyJsonWithBigInt(rest, 2)}`
}

export const logger = winston.createLogger({
  exitOnError: false,
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => {
      if (isProduction) {
        return formatLocalLog(info)
      }

      const details = cleanDetails(info)

      return stringifyJsonWithBigInt({
        level: info.level,
        ...details
      })
    })
  )
})
