import { signTransactionRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { z } from 'zod'

type SignTransactionRequest = z.infer<typeof signTransactionRequestSchema>

describe('signTransactionRequestSchema', () => {
  it('parses a sign transaction request', () => {
    const signTransactionRequest: SignTransactionRequest = {
      from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
      to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
      data: '0x'
    }

    const parse = signTransactionRequestSchema.safeParse(signTransactionRequest)

    expect(parse.success).toEqual(true)
  })
})
