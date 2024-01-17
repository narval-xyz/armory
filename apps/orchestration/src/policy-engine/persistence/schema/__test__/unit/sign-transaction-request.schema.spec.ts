import { readSignTransactionRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { z } from 'zod'

type ReadSignTransactionRequest = z.infer<typeof readSignTransactionRequestSchema>

describe('signTransactionRequestSchema', () => {
  describe('read', () => {
    it('parses a sign transaction request', () => {
      const signTransactionRequest: ReadSignTransactionRequest = {
        from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
        to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
        data: '0x',
        gas: BigInt(5_000),
        chainId: 1,
        nonce: 0
      }

      const parse = readSignTransactionRequestSchema.safeParse(signTransactionRequest)

      expect(parse.success).toEqual(true)
    })
  })
})
