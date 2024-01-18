import { Hex } from 'viem'
import { InputType } from './lib/domain'
import { decode } from './lib/export'
import { Erc20Methods } from './lib/methodId'
import { TransactionInput } from './lib/types'

const input: TransactionInput = {
  type: InputType.TRANSACTION_REQUEST,
  txRequest: {
    to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
    data: `${Erc20Methods.TRANSFER}000000000000000000000000fe8f4de6e39c523ced231e7a72628f58e0ffee71000000000000000000000000000000000000000000000000000000000007a120` as Hex,
    from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
    chainId: '137',
    nonce: 10
  }
}

const main = () => {
  const decoded = decode(input)
  console.log(decoded)
}

main()
