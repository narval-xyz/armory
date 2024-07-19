import { TransactionRequest } from '../type/action.type'

export const getTxType = (tx: TransactionRequest): '0' | '2' | undefined => {
  if (tx.type) {
    return tx.type
  }

  if ('maxFeePerGas' in tx || 'maxPriorityFeePerGas' in tx) {
    return '2'
  }

  if ('gasPrice' in tx) {
    return '0'
  }

  return undefined
}
