import { ChainAccountId, toChainAccountId, TransactionRequest } from '@narval/policy-engine-shared'
import z from 'zod'
import { TransactionStatus } from '../domain'

export const TransactionRegistryInput = z.array(
  z.object({
    txRequest: TransactionRequest,
    status: z.nativeEnum(TransactionStatus)
  })
)
export type TransactionRegistryInput = z.infer<typeof TransactionRegistryInput>

export const TransactionKey = z
  .tuple([ChainAccountId, z.number().int().positive()])
  .transform(([chainAccountId, number]) => `${chainAccountId}-${number}` as `${ChainAccountId}-${number}`)
export type TransactionKey = z.infer<typeof TransactionKey>

export class TransactionRegistry extends Map<TransactionKey, TransactionStatus> {
  constructor(input?: TransactionRegistryInput) {
    if (!input) {
      super()
      return
    }
    const validInput = TransactionRegistryInput.parse(input)

    const entries = validInput.map(({ txRequest, status }): [TransactionKey, TransactionStatus] => {
      const account = toChainAccountId({
        chainId: txRequest.chainId,
        address: txRequest.from
      })

      const nonce = txRequest.nonce
      const transactionKey = TransactionKey.parse([account, nonce])

      return [transactionKey, status]
    })

    super(entries)
  }
}
