import { transactionRequestIntent } from '@narval/transaction-request-intent'

describe('transactionRequestIntent', () => {
  it('should work', () => {
    expect(transactionRequestIntent()).toEqual('transaction-request-intent')
  })
})
