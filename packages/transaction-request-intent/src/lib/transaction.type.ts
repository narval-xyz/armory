import { AccessList, Address, Hex } from 'viem'

// TODO: Copied from new @authz-shared package; change to importing that directly
export type TransactionRequest = {
  chainId: number
  from: Address
  nonce?: number
  accessList?: AccessList
  data?: Hex
  gas?: bigint
  to?: Address | null
  type?: '2'
  value?: Hex
}
