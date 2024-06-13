import { Action, Eip712TypedData, Request } from '@narval/policy-engine-shared'
import { Jwk, Secp256k1PublicKey, secp256k1PrivateKeyToJwk, verifySecp256k1 } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
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
import { Origin, PrivateAccount } from '../../../../../shared/type/domain.type'
import { AccountRepository } from '../../../../persistence/repository/account.repository'
import { NonceService } from '../../nonce.service'
import { SigningService } from '../../signing.service'

describe('SigningService', () => {
  let signingService: SigningService
  let nonceServiceMock: MockProxy<NonceService>

  const account: PrivateAccount = {
    id: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5',
    publicKey:
      '0x04b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba',
    origin: Origin.GENERATED
  }
  const privateKey: Jwk = secp256k1PrivateKeyToJwk(account.privateKey)

  beforeEach(async () => {
    nonceServiceMock = mock<NonceService>()

    const module = await Test.createTestingModule({
      providers: [
        SigningService,
        {
          provide: NonceService,
          useValue: nonceServiceMock
        },
        {
          provide: AccountRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(account)
          }
        }
      ]
    }).compile()

    signingService = module.get<SigningService>(SigningService)
  })

  const clientId = 'test-client-id'

  const nonce = 'test-nonce'

  describe('signTransaction', () => {
    const request: Request = {
      action: 'signTransaction',
      nonce,
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

    it('signs the request and return a string', async () => {
      const expectedSignature =
        '0x02f875818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba06f7648a9c9710b171d55e056c4abca268857f607a8a4a257d945fc44ace9f076'

      const result = await signingService.sign(clientId, request)

      expect(result).toEqual(expectedSignature)
    })

    it('saves the nonce on success', async () => {
      await signingService.signTransaction(clientId, request)

      expect(nonceServiceMock.save).toHaveBeenCalledWith(clientId, nonce)
    })
  })

  describe('signMessage', () => {
    const eip191Request: Request = {
      action: Action.SIGN_MESSAGE,
      nonce,
      message: 'My ASCII message',
      resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    }

    it('signs EIP191 message string', async () => {
      const expectedSignature =
        '0x65071b7126abd24fe6b8fa396529e21d22448d23ff1a6c5a0e043a4f641cd11b2a21958127d1b91db4d991f8b33ad6b201637799a95eadbe3a7cf5cee26bd9521b'

      const result = await signingService.sign(clientId, eip191Request)

      const isVerified = await verifyMessage({
        address: account.address,
        message: eip191Request.message,
        signature: result
      })

      expect(result).toEqual(expectedSignature)
      expect(isVerified).toEqual(true)
    })

    it('signs EIP191 message hex', async () => {
      const messageRequest: Request = {
        action: Action.SIGN_MESSAGE,
        nonce,
        message: {
          raw: toHex('My ASCII message')
        },
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const expectedSignature =
        '0x65071b7126abd24fe6b8fa396529e21d22448d23ff1a6c5a0e043a4f641cd11b2a21958127d1b91db4d991f8b33ad6b201637799a95eadbe3a7cf5cee26bd9521b'

      const result = await signingService.sign(clientId, messageRequest)

      const isVerified = await verifyMessage({
        address: account.address,
        message: messageRequest.message,
        signature: result
      })

      expect(result).toEqual(expectedSignature)
      expect(isVerified).toEqual(true)
    })

    it('saves the nonce on success', async () => {
      await signingService.signMessage(clientId, eip191Request)

      expect(nonceServiceMock.save).toHaveBeenCalledWith(clientId, nonce)
    })
  })

  describe('signTypedData', () => {
    const typedData: Eip712TypedData = {
      domain: {
        chainId: 137,
        name: 'Crypto Unicorns Authentication',
        version: '1'
      },
      message: {
        contents: 'UNICOOOORN :)',
        account: '0xdd4d43575a5eff17ec814da6ea810a0cc39ff23e',
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
            name: 'account',
            type: 'address'
          },
          {
            name: 'nonce',
            type: 'string'
          }
        ]
      }
    }

    const typedDataRequest: Request = {
      action: Action.SIGN_TYPED_DATA,
      nonce,
      resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      typedData
    }

    it('signs EIP712 typed data', async () => {
      const expectedSignature =
        '0xbe42104616b1ba99ef8a3497660f47387110297f5a2f90080ec42f2674fe3fdf01d65502d13a106544e2a4bd8504c2b38208b141fe3b02e8ae3354181cce284e1b'

      const result = await signingService.sign(clientId, typedDataRequest)

      const isVerified = await verifyTypedData({
        address: account.address,
        signature: result,
        ...typedData
      })

      expect(isVerified).toEqual(true)
      expect(result).toEqual(expectedSignature)
    })

    it('saves the nonce on success', async () => {
      await signingService.signTypedData(clientId, typedDataRequest)

      expect(nonceServiceMock.save).toHaveBeenCalledWith(clientId, nonce)
    })
  })

  describe('signRaw', () => {
    const stringMessage = 'My ASCII message'
    const byteMessage = stringToBytes(stringMessage)
    const hexMessage = bytesToHex(byteMessage)

    const rawRequest: Request = {
      action: Action.SIGN_RAW,
      nonce,
      rawMessage: hexMessage,
      resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    }

    it('signs raw payload', async () => {
      const result = await signingService.sign(clientId, rawRequest)
      const isVerified = await verifySecp256k1(result, byteMessage, privateKey as Secp256k1PublicKey)

      expect(isVerified).toEqual(true)
    })

    it('saves the nonce on success', async () => {
      await signingService.signRaw(clientId, rawRequest)

      expect(nonceServiceMock.save).toHaveBeenCalledWith(clientId, nonce)
    })
  })

  it('does support round-trip serialization', async () => {
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
})
