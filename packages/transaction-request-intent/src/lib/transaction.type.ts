import { AccessList, Address, Hex } from 'viem'

export type TransactionRequest<TQuantity = Hex, TIndex = number, TTransactionType = '2'> = {
  /** Contract code or a hashed method call with encoded args */
  data?: Hex
  /** Transaction sender */
  from: Address
  /** Gas provided for transaction execution */
  gas?: TQuantity
  /** Unique number identifying this transaction */
  nonce?: TIndex
  /** Transaction recipient */
  to?: Address | null
  /** Value in wei sent with this transaction */
  value?: TQuantity
  chainId: string | null
  accessList?: AccessList
  type?: TTransactionType
  hash?: Hex
}
