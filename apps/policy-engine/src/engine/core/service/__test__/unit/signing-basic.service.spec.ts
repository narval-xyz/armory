import { Test, TestingModule } from '@nestjs/testing'
import { SimpleSigningService } from '../../signing-basic.service'

describe('SimpleSigningService', () => {
  let service: SimpleSigningService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimpleSigningService]
    }).compile()

    service = module.get<SimpleSigningService>(SimpleSigningService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('generateKey', () => {
    it('should generate a public and private key pair', async () => {
      const result = await service.generateKey()
      expect(result.publicKey.kid).toBeDefined()
      expect(result.publicKey.kid).toEqual(result.privateKey.kid)
    })

    it('should generate a public and private key pair with the provided keyId', async () => {
      const keyId = 'testKeyId'
      const result = await service.generateKey(keyId)
      expect(result.privateKey.kid).toBe(keyId)
      expect(result.publicKey.kid).toEqual(result.privateKey.kid)
    })
  })
})
