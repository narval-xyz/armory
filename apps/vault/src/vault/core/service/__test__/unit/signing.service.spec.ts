import { MetricService, OTEL_ATTR_CLIENT_ID, OpenTelemetryModule, StatefulMetricService } from '@narval/nestjs-shared'
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
  let statefulMetricService: StatefulMetricService

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
      imports: [OpenTelemetryModule.forTest()],
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

    signingService = module.get(SigningService)
    statefulMetricService = module.get(MetricService)
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

    it('supports "0x" as a valid "value" field', async () => {
      const requestWithZeroValue: Request = {
        action: 'signTransaction',
        nonce,
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        transactionRequest: {
          from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
          to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
          chainId: 137,
          value: '0x',
          data: '0x',
          nonce: 317,
          type: '2',
          gas: 21004n,
          maxFeePerGas: 291175227375n,
          maxPriorityFeePerGas: 81000000000n
        }
      }

      const expectedSignature =
        '0x02f86f818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b8080c001a0552bbb419f7143267e39f56eda6478af1a635d839662e848a20934f49be8b192a008be69a5c45796365ae061da8c730017ab61f3a6aa08c4a9fef6ca5a7a574fee'

      const result = await signingService.sign(clientId, requestWithZeroValue)

      expect(result).toEqual(expectedSignature)
    })

    it('increments counter metric', async () => {
      await signingService.signTransaction(clientId, request)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'sign_transaction_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
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

    it('increments counter metric', async () => {
      await signingService.signMessage(clientId, eip191Request)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'sign_message_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
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
        '0xea6ce84f494775a0b65fc3f95d23021a6c83052c3ac02f2c028aa35e7643569b7f592a435bf83bc00802bf72285e226ac7cfcb06844f74e9814e39940808808a1c'

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

    it('increments counter metric', async () => {
      await signingService.signTypedData(clientId, typedDataRequest)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'sign_typed_data_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
    })
  })

  describe('signUserOperation', () => {
    const userOpRequest: Request = {
      action: 'signUserOperation',
      nonce,
      resourceId: 'eip155:eoa:0xd9d431ad45d96dd9eeb05dd0a7d66876d1d74c4b',
      userOperation: {
        sender: '0x17Ae006F046e023A2e98aEb687b63615c1B69010',
        nonce: 0n,
        initCode:
          '0x9406Cc6185a346906296840746125a0E449764545fbfb9cf000000000000000000000000d9d431ad45d96dd9eeb05dd0a7d66876d1d74c4b0000000000000000000000000000000000000000000000000000000000000000',
        callData:
          '0xb61d27f6000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
        callGasLimit: 82511n,
        verificationGasLimit: 526140n,
        preVerificationGas: 65912n,
        maxFeePerGas: 31775842396n,
        maxPriorityFeePerGas: 1200000000n,
        paymasterAndData:
          '0xDFF7FA1077Bce740a6a212b3995990682c0Ba66d000000000000000000000000000000000000000000000000000000006686a49d0000000000000000000000000000000000000000000000000000000000000000c9cd3f0fdd847ea7e02a9a7ed8dda9067dc4da959750f2aed1b33198bef83cee75a3a15f3c90f881476a508beb21305cdbce6b93502db8b4831a955ec11a08111c',
        entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        signature:
          '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
        factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454',
        chainId: 11155111
      }
    }

    it('signs user operation', async () => {
      const result = await signingService.sign(clientId, userOpRequest)

      const expectedSignature =
        '0x687fda1fcebeed665d6f738a2d1a7e952e41434ae010c58aaa9623fe991a0a716d8d0d27d5192aaf7231965c44ae9abbe0c126068ef5e42f201de1138f82f8301b'
      expect(result).toEqual(expectedSignature)
    })

    it('saves the nonce on success', async () => {
      await signingService.signUserOperation(clientId, userOpRequest)
      expect(nonceServiceMock.save).toHaveBeenCalledWith(clientId, nonce)
    })

    it('increments counter metric', async () => {
      await signingService.signUserOperation(clientId, userOpRequest)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'sign_user_operation_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
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

    it('increments counter metric', async () => {
      await signingService.signRaw(clientId, rawRequest)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'sign_raw_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
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
