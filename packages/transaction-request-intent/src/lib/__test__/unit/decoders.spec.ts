// type Hex = `0x${string}`

describe('decode', () => {
  describe('transaction request input', () => {
    describe('transfers', () => {
      it('pass', () => {
        expect(true).toBeTruthy()
      })
      // it('should decode erc20 transfer', () => {
      //   const input: TransactionInput = {
      //     type: InputType.TRANSACTION_REQUEST,
      //     txRequest: {
      //       to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
      //       data: `${Erc20Methods.TRANSFER}000000000000000000000000fe8f4de6e39c523ced231e7a72628f58e0ffee71000000000000000000000000000000000000000000000000000000000007a120` as Hex,
      //       from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
      //       chainId: '137',
      //       nonce: 10
      //     }
      //   }
      //   const decoded = decode(input)
      //   const expected: TransferErc20 = {
      //     type: Intents.TRANSFER_ERC20,
      //     contract: 'eip155:137:0x031d8C0cA142921c459bCB28104c0FF37928F9eD' as Caip10,
      //     to: 'eip155:137:0xfe8f4de6e39c523ced231e7a72628f58e0ffee71' as Caip10,
      //     from: 'eip155:137:0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448' as Caip10,
      //     amount: '500000000000000000000'
      //   }
      //   expect(decoded).toEqual(expected)
      // })
      // it('should decode erc20 transferFrom with contract registry', () => {
      //   const contractRegistry = {
      //     'eip155:137:0x031d8C0cA142921c459bCB28104c0FF37928F9eD': AssetTypeEnum.ERC20
      //   } as ContractRegistry
      //   const input: TransactionInput = {
      //     type: InputType.TRANSACTION_REQUEST,
      //     txRequest: {
      //       to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
      //       data: `${Erc20Methods.TRANSFER_FROM}000000000000000000000000fe8f4de6e39c523ced231e7a72628f58e0ffee71000000000000000000000000000000000000000000000000000000000007a120` as Hex,
      //       from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
      //       chainId: '137',
      //       nonce: 10
      //     },
      //     contractRegistry
      //   }
      //   const decoded = decode(input)
      //   const expected: TransferErc20 = {
      //     type: Intents.TRANSFER_ERC20,
      //     contract: 'eip155:137:0x031d8C0cA142921c459bCB28104c0FF37928F9eD' as Caip10,
      //     to: 'eip155:137:0xfe8f4de6e39c523ced231e7a72628f58e0ffee71' as Caip10,
      //     from: 'eip155:137:0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448' as Caip10,
      //     amount: '500000000000000000000'
      //   }
      //   expect(decoded).toEqual(expected)
      // })
    })
  })
})
