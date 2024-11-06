import { Alg } from '@narval/signature'
import { Hex } from 'viem'
import { decode } from '../../decoders/decode'
import { ContractRegistry, InputType, Intents, PERMIT2_ADDRESS, TransactionStatus, WalletType } from '../../domain'
import { buildContractRegistry, buildTransactionKey, buildTransactionRegistry } from '../../utils'
import {
  mockCancelTransaction,
  mockErc1155BatchSafeTransferFrom,
  mockErc1155SafeTransferFrom,
  mockErc20Transfer,
  mockErc721SafeTransferFrom
} from './mocks'

describe('decode', () => {
  const transactionRegistry = buildTransactionRegistry([])
  describe('transaction request input', () => {
    describe('transfers', () => {
      it('decodes erc20 transfer', () => {
        const decoded = decode({ input: mockErc20Transfer.input })
        expect(decoded).toEqual(mockErc20Transfer.intent)
      })
      it('decodes erc721 safeTransferFrom', () => {
        const decoded = decode({ input: mockErc721SafeTransferFrom.input })
        expect(decoded).toEqual(mockErc721SafeTransferFrom.intent)
      })
      it('decodes erc1155 safeTransferFrom', () => {
        const decoded = decode({ input: mockErc1155SafeTransferFrom.input })
        expect(decoded).toEqual(mockErc1155SafeTransferFrom.intent)
      })
      it('decodes erc1155 safeBatchTransferFrom', () => {
        const decoded = decode({ input: mockErc1155BatchSafeTransferFrom.input })
        expect(decoded).toEqual(mockErc1155BatchSafeTransferFrom.intent)
      })
      it('decodes a Native Transfer', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
              value: '0x4124',
              from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
              chainId: 137,
              nonce: 10
            }
          }
        })
        expect(decoded).toEqual({
          type: Intents.TRANSFER_NATIVE,
          to: 'eip155:137:0x031d8c0ca142921c459bcb28104c0ff37928f9ed',
          from: 'eip155:137:0xed123cf8e3ba51c6c15da1eac74b2b5deea31448',
          amount: '16676',
          token: 'eip155:137/slip44:966'
        })
      })
      it('decodes approve token allowance', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
              data: '0x095ea7b30000000000000000000000001111111254eeb25477b68fb85ed929f73a9605821984862f285d9925ca94e9e52a28867736f1114e8b27b3300dbbaf71ed200b67',
              from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
              chainId: 137,
              nonce: 10
            }
          }
        })
        expect(decoded).toEqual({
          type: Intents.APPROVE_TOKEN_ALLOWANCE,
          from: 'eip155:137:0xed123cf8e3ba51c6c15da1eac74b2b5deea31448',
          token: 'eip155:137:0x031d8c0ca142921c459bcb28104c0ff37928f9ed',
          amount: '11541971132511365478906515907109950360107522067033065608472376982619868367719',
          spender: 'eip155:137:0x1111111254eeb25477b68fb85ed929f73a960582'
        })
      })
      it('decodes user operation', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              to: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
              data: '0xb61d27f6000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
              from: '0x791b1689526B5560145F99cB9D3B7F24eca2591a',
              chainId: 1
            }
          }
        })
        expect(decoded).toEqual({
          type: Intents.USER_OPERATION,
          from: 'eip155:1:0x791b1689526b5560145f99cb9d3b7f24eca2591a',
          entrypoint: 'eip155:1:0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
          operationIntents: [
            {
              amount: '1',
              from: 'eip155:1:0x791b1689526b5560145f99cb9d3b7f24eca2591a',
              to: 'eip155:1:0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
              token: 'eip155:1/slip44:60',
              type: Intents.TRANSFER_NATIVE
            }
          ]
        })
      })
      it('defaults to contract call intent', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
              data: '0xf2d12b1200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000ae00000000000000000000000000000000000000000000000000000000000000be000000000000000000000000035ef74daa541eb3fc24e0f167893eed3ed2c51910000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004c0000000000000000000000000601c01253057d267e7fb8684f608785b03dffb5a000000000000000000000000000000e7ec00e7b300774b00001314b8610022b80000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000065a7ffc40000000000000000000000000000000000000000000000000000000065a9513a0000000000000000000000000000000000000000000000000000000000000000360c6ebe00000000000000000000000000000000000000001e5b59b0367d550f0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f00000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f61900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037112afa04c0000000000000000000000000000000000000000000000000000037112afa04c0000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000073f9ea501f1d874c6afa3442c8971e1e278469a3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000601c01253057d267e7fb8684f608785b03dffb5a00000000000000000000000000000000000000000000000000000000000000010000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f61900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001606ddfd9b8000000000000000000000000000000000000000000000000000001606ddfd9b8000000000000000000000000000000a26b00c1f0df003000390027140000faa719000000000000000000000000000000000000000000000000000000000000004041bdcf7843c4d42a367340978cf0fc2f231cb3ec776981647da5661593ebcd5dca3d8b9586431c20c790d4e29f15c9c2e92f156f4ff723cd225c4857e144aac2000000000000000000000000000000000000000000000000000000000000007e0035ef74daa541eb3fc24e0f167893eed3ed2c51910000000065a8267691654e0142e721e29ee0657613ea6767b9b2a2ca61ec2a3795324b9bc370a76aba30e69c73bff110ab7443a1f3c5127547b7fdb9912b3f19bd099a3ff24dde69000000000000000000000000000000000000000000000000000000000000001732000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000460000000000000000000000000000000000000000000000000000000000000048000000000000000000000000035ef74daa541eb3fc24e0f167893eed3ed2c519100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065a7ffc40000000000000000000000000000000000000000000000000000000065a9513a0000000000000000000000000000000000000000000000000000000000000000360c6ebe000000000000000000000000000000000000000015125a606e8248df0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000073f9ea501f1d874c6afa3442c8971e1e278469a3000000000000000000000000000000000000000000000000000000000000173200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f619000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008cf8bff0b00000000000000000000000000000000000000000000000000000008cf8bff0b000000000000000000000000000cda31ef080e99f60573c4d8c426d32b05a44ac4f00000000000000000000000000000000000000000000000000000000000000010000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003523c45a3a5800000000000000000000000000000000000000000000000000003523c45a3a580000000000000000000000000035ef74daa541eb3fc24e0f167893eed3ed2c51910000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000173200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000360c6ebe',
              from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
              chainId: 137,
              nonce: 10
            }
          }
        })
        expect(decoded).toEqual({
          type: Intents.CALL_CONTRACT,
          from: 'eip155:137:0xed123cf8e3ba51c6c15da1eac74b2b5deea31448',
          contract: 'eip155:137:0x031d8c0ca142921c459bcb28104c0ff37928f9ed',
          hexSignature: '0xf2d12b12'
        })
      })
    })
    describe('transaction management', () => {
      // SET A FAILED TO TRANSACTION ON FIRST MOCK DATA
      const key = buildTransactionKey(mockErc20Transfer.input.txRequest)
      transactionRegistry.set(key, TransactionStatus.FAILED)
      it('should find the transaction in the registry', () => {
        const trxStatus = transactionRegistry.get(buildTransactionKey(mockErc20Transfer.input.txRequest))
        expect(trxStatus).toEqual(TransactionStatus.FAILED)
      })
      // NOW ITS A PENDING
      it('decodes retry transaction', () => {
        const trxRegistry = buildTransactionRegistry([
          {
            txRequest: mockErc20Transfer.input.txRequest,
            status: TransactionStatus.PENDING
          }
        ])
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: mockErc20Transfer.input.txRequest
          },
          config: {
            transactionRegistry: trxRegistry
          }
        })
        expect(decoded).toEqual({
          type: Intents.RETRY_TRANSACTION
        })
      })
      it('decodes cancel transaction', () => {
        transactionRegistry.set(key, TransactionStatus.PENDING)
        const decoded = decode({ input: mockCancelTransaction })
        expect(decoded).toEqual({
          type: Intents.CANCEL_TRANSACTION
        })
      })
    })
    describe('contract creation', () => {
      let contractRegistry: ContractRegistry

      const knownSafeFactory = '0xaaad8C0cA142921c459bCB28104c0FF37928F9eD'
      const knownSafeMaster = '0xbbbd8C0cA142921c459bCB28104c0FF37928F9eD'
      const knownErc4337Factory = '0xcccd8C0cA142921c459bCB28104c0FF37928F9eD'
      const knownErc4337Master = '0xdddd8C0cA142921c459bCB28104c0FF37928F9eD'
      beforeEach(() => {
        contractRegistry = buildContractRegistry([
          {
            contract: {
              address: knownSafeFactory,
              chainId: 137
            },
            factoryType: WalletType.SAFE
          },
          {
            contract: {
              address: knownSafeMaster,
              chainId: 1
            },
            factoryType: WalletType.SAFE
          },
          {
            contract: {
              address: knownErc4337Factory,
              chainId: 137
            },
            factoryType: WalletType.ERC4337
          },
          {
            contract: {
              address: knownErc4337Master,
              chainId: 1
            },
            factoryType: WalletType.ERC4337
          }
        ])
      })
      it('decodes safe wallet creation deployment from a known factory', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              from: knownSafeFactory,
              chainId: 137,
              data: '0x41284124120948012849081209470127490127940790127490712038017403178947109247'
            }
          },
          config: {
            contractRegistry
          }
        })
        expect(decoded).toEqual({
          type: Intents.DEPLOY_SAFE_WALLET,
          from: 'eip155:137:0xaaad8c0ca142921c459bcb28104c0ff37928f9ed',
          chainId: 137
        })
      })
      it('decodes erc4337 wallet deployment when deploying from a known factory', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              from: knownErc4337Factory,
              chainId: 137,
              data: '0x41284124120948012849081209470127490127940790127490712038017403178947109247'
            }
          },
          config: {
            contractRegistry
          }
        })
        expect(decoded).toEqual({
          type: Intents.DEPLOY_ERC_4337_WALLET,
          from: 'eip155:137:0xcccd8c0ca142921c459bcb28104c0ff37928f9ed',
          chainId: 137,
          bytecode: '0x41284124120948012849081209470127490127940790127490712038017403178947109247'
        })
      })
      it('defaults to deploy intent', () => {
        const decoded = decode({
          input: {
            type: InputType.TRANSACTION_REQUEST,
            txRequest: {
              from: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
              chainId: 137,
              data: '0x'
            }
          },
          config: {
            contractRegistry
          }
        })
        expect(decoded).toEqual({
          type: Intents.DEPLOY_CONTRACT,
          from: 'eip155:137:0x031d8c0ca142921c459bcb28104c0ff37928f9ed',
          chainId: 137
        })
      })
    })
  })
  describe('message and typed data input', () => {
    it('decodes typed data', () => {
      const decoded = decode({
        input: {
          type: InputType.TYPED_DATA,
          typedData: {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
              ],
              DoStuff: [
                { name: 'do', type: 'function' },
                { name: 'stuff', type: 'address' }
              ]
            },
            primaryType: 'DoStuff',
            domain: {
              name: 'Unicorn Milk Token',
              version: '0.1.0',
              chainId: 137,
              verifyingContract: '0x64060aB139Feaae7f06Ca4E63189D86aDEb51691'
            },
            message: {
              do: 'doingStuff(address stuff)',
              stuff: '0x1234567890123456789012345678901234567890'
            }
          }
        }
      })
      expect(decoded).toEqual({
        type: Intents.SIGN_TYPED_DATA,
        typedData: {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' }
            ],
            DoStuff: [
              { name: 'do', type: 'function' },
              { name: 'stuff', type: 'address' }
            ]
          },
          primaryType: 'DoStuff',
          domain: {
            name: 'Unicorn Milk Token',
            version: '0.1.0',
            chainId: 137,
            verifyingContract: '0x64060aB139Feaae7f06Ca4E63189D86aDEb51691'.toLowerCase()
          },
          message: {
            do: 'doingStuff(address stuff)',
            stuff: '0x1234567890123456789012345678901234567890'
          }
        }
      })
    })
    it('decodes raw message', () => {
      const decoded = decode({
        input: {
          type: InputType.RAW,
          raw: {
            algorithm: Alg.ES256K,
            payload: '0xdeadbeef'
          }
        }
      })
      expect(decoded).toEqual({
        type: Intents.SIGN_RAW,
        algorithm: Alg.ES256K,
        payload: '0xdeadbeef'
      })
    })
    it('decodes permit', () => {
      const permit = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        domain: {
          name: 'ERC20 Token Name',
          version: '1',
          chainId: 137,
          verifyingContract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Hex
        },
        primaryType: 'Permit',
        message: {
          owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          spender: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
          value: '1000000000000000000',
          nonce: '0',
          deadline: '9999999999'
        }
      }
      const decoded = decode({
        input: {
          type: InputType.TYPED_DATA,
          typedData: permit
        }
      })
      expect(decoded).toEqual({
        type: Intents.PERMIT,
        spender: 'eip155:137:0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
        token: 'eip155:137:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount: '1000000000000000000',
        deadline: '9999999999',
        owner: 'eip155:137:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
      })
    })
    it('decodes permit2', () => {
      const permit2 = {
        chainId: 137,
        from: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448' as Hex,
        types: {
          PermitSingle: [
            { name: 'details', type: 'PermitDetails' },
            { name: 'spender', type: 'address' },
            { name: 'sigDeadline', type: 'uint256' }
          ],
          PermitDetails: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint160' },
            { name: 'expiration', type: 'uint48' },
            { name: 'nonce', type: 'uint48' }
          ]
        },
        primaryType: 'Permit2',
        domain: {
          version: '1',
          name: 'Permit2',
          chainId: 137,
          verifyingContract: PERMIT2_ADDRESS as Hex
        },
        message: {
          details: {
            owner: '0xEd123cf8e3bA51c6C15DA1eAc74B2b5DEEA31448',
            token: '0x64060aB139Feaae7f06Ca4E63189D86aDEb51691',
            amount: '0xffffffffffffffffffffffffffffffffffffffff',
            expiration: 1709143217,
            nonce: 2
          },
          spender: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
          sigDeadline: 1706659217
        }
      }
      const decoded = decode({
        input: {
          type: InputType.TYPED_DATA,
          typedData: permit2
        }
      })
      expect(decoded).toEqual({
        type: Intents.PERMIT2,
        token: 'eip155:137:0x64060ab139feaae7f06ca4e63189d86adeb51691',
        spender: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
        amount: '1461501637330902918203684832716283019655932542975',
        deadline: 1709143217,
        owner: 'eip155:137:0xed123cf8e3ba51c6c15da1eac74b2b5deea31448'
      })
    })
  })
})
