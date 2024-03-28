import { Action, Eip712TypedData, Request } from '@narval/policy-engine-shared'
import { Jwk, Secp256k1PublicKey, secp256k1PrivateKeyToJwk, verifySepc256k1 } from '@narval/signature'
import { Test } from '@nestjs/testing'
import {
  Hex,
  TransactionSerializable,
  bytesToHex,
  hexToBigInt,
  parseTransaction,
  serializeTransaction,
  stringToBytes,
  toHex,
  verifyMessage,
  verifyTypedData
} from 'viem'
import { Wallet } from '../../../../../shared/type/domain.type'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { SigningService } from '../../signing.service'

describe('SigningService', () => {
  let signingService: SigningService

  const wallet: Wallet = {
    id: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  }
  const privateKey: Jwk = secp256k1PrivateKeyToJwk(wallet.privateKey)

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SigningService,
        {
          provide: WalletRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(wallet)
          }
        }
      ]
    }).compile()

    signingService = moduleRef.get<SigningService>(SigningService)
  })

  describe('sign', () => {
    it('should sign the request and return a string', async () => {
      // Mock the dependencies and setup the test data
      const tenantId = 'tenantId'
      const request: Request = {
        action: 'signTransaction',
        nonce: 'random-nonce-111',
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        transactionRequest: {
          from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
          to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
          chainId: 137,
          value: '0x5af3107a4000',
          data: '0x',
          nonce: 317,
          type: '2',
          gas: 21004n,
          maxFeePerGas: 291175227375n,
          maxPriorityFeePerGas: 81000000000n
        }
      }

      const expectedSignature =
        '0x02f875818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba06f7648a9c9710b171d55e056c4abca268857f607a8a4a257d945fc44ace9f076'

      // Call the sign method
      const result = await signingService.sign(tenantId, request)

      // Assert the result
      expect(result).toEqual(expectedSignature)
    })

    // Just for testing formatting & stuff
    it('should serialize/deserialize', async () => {
      const txRequest: TransactionSerializable = {
        // from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B'.toLowerCase() as Hex,
        chainId: 137,
        value: hexToBigInt('0x5af3107a4000'),
        type: 'eip1559'
      }

      const serialized = serializeTransaction(txRequest)
      const deserialized = parseTransaction(serialized)

      expect(deserialized).toEqual(txRequest)
    })

    it('signs EIP191 Message string', async () => {
      const tenantId = 'tenantId'
      const messageRequest: Request = {
        action: Action.SIGN_MESSAGE,
        nonce: 'random-nonce-111',
        message: 'My ASCII message',
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const expectedSignature =
        '0x65071b7126abd24fe6b8fa396529e21d22448d23ff1a6c5a0e043a4f641cd11b2a21958127d1b91db4d991f8b33ad6b201637799a95eadbe3a7cf5cee26bd9521b'

      // Call the sign method
      const result = await signingService.sign(tenantId, messageRequest)

      const isVerified = await verifyMessage({
        address: wallet.address,
        message: messageRequest.message,
        signature: result
      })

      // Assert the result
      expect(result).toEqual(expectedSignature)
      expect(isVerified).toEqual(true)
    })

    it('signs EIP191 Message Hex', async () => {
      const tenantId = 'tenantId'
      const messageRequest: Request = {
        action: Action.SIGN_MESSAGE,
        nonce: 'random-nonce-111',
        message: {
          raw: toHex('My ASCII message')
        },
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const expectedSignature =
        '0x65071b7126abd24fe6b8fa396529e21d22448d23ff1a6c5a0e043a4f641cd11b2a21958127d1b91db4d991f8b33ad6b201637799a95eadbe3a7cf5cee26bd9521b'

      // Call the sign method
      const result = await signingService.sign(tenantId, messageRequest)

      const isVerified = await verifyMessage({
        address: wallet.address,
        message: messageRequest.message,
        signature: result
      })

      // Assert the result
      expect(result).toEqual(expectedSignature)
      expect(isVerified).toEqual(true)
    })

    it('signs EIP712 Typed Data', async () => {
      const typedData: Eip712TypedData = {
        domain: {
          chainId: 137,
          name: 'Crypto Unicorns Authentication',
          version: '1'
        },
        message: {
          contents: 'UNICOOOORN :)',
          wallet: '0xdd4d43575a5eff17ec814da6ea810a0cc39ff23e',
          nonce: '0e01c9bd-94a0-4ba1-925d-ab02688e65de'
        },
        primaryType: 'Validator',
        types: {
          EIP712Domain: [
            {
              name: 'name',
              type: 'string'
            },
            {
              name: 'version',
              type: 'string'
            },
            {
              name: 'chainId',
              type: 'uint256'
            }
          ],
          Validator: [
            {
              name: 'contents',
              type: 'string'
            },
            {
              name: 'wallet',
              type: 'address'
            },
            {
              name: 'nonce',
              type: 'string'
            }
          ]
        }
      }
      const tenantId = 'tenantId'
      const typedDataRequest: Request = {
        action: Action.SIGN_TYPED_DATA,
        nonce: 'random-nonce-111',
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        typedData
      }

      const expectedSignature =
        '0x1f6b8ebbd066c5a849e37fc890c1f2f1b6b0a91e3dd3e8279c646948e8f14b030a13a532fd04c6b5d92e11e008558b0b60b6d061c8f34483af7deab0591317da1b'

      // Call the sign method
      const result = await signingService.sign(tenantId, typedDataRequest)

      const isVerified = await verifyTypedData({
        address: wallet.address,
        signature: result,
        ...typedData
      })

      // Assert the result
      expect(isVerified).toEqual(true)
      expect(result).toEqual(expectedSignature)
    })

    it('signs raw payload', async () => {
      const stringMessage = 'My ASCII message'
      const byteMessage = stringToBytes(stringMessage)
      const hexMessage = bytesToHex(byteMessage)

      const tenantId = 'tenantId'
      const rawRequest: Request = {
        action: Action.SIGN_RAW,
        nonce: 'random-nonce-111',
        rawMessage: hexMessage,
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const result = await signingService.sign(tenantId, rawRequest)

      const isVerified = await verifySepc256k1(result, byteMessage, privateKey as Secp256k1PublicKey)
      expect(isVerified).toEqual(true)
    })
  })
})
