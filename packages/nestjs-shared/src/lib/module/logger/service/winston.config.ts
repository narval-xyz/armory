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

const formatLocalLog = ({ timestamp, level, message, context, trace }: winston.Logform.TransformableInfo) => {
  return `${timestamp} [${context}] ${level.toUpperCase()}: ${message}${trace ? `\n${stringifyJsonWithBigInt(trace, 2)}` : ''}`
}

export const logger = winston.createLogger({
  exitOnError: false,
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => {
      if (!isProduction) {
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
