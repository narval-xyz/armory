import { Request } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { Hex, TransactionSerializable, hexToBigInt, parseTransaction, serializeTransaction } from 'viem'
import { Wallet } from '../../../../../shared/type/domain.type'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { SigningService } from '../../signing.service'

describe('SigningService', () => {
  let signingService: SigningService

  const wallet: Wallet = {
    id: 'eip155:eoa:0xc3bdcdb4f593aa5a5d81cd425f6fc3265d962157',
    address: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  }

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
        resourceId: 'eip155:eoa:0xc3bdcdb4f593aa5a5d81cd425f6fc3265d962157',
        transactionRequest: {
          from: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
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
        // from: '0xc3bdcdb4F593AA5A5D81cD425f6Fc3265D962157',
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
})
