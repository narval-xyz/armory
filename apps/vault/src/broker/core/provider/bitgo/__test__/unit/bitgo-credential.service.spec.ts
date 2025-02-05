import { Test } from '@nestjs/testing'
import '../../../../../shared/__test__/matcher'
import { ConnectionInvalidCredentialsException } from '../../../../exception/connection-invalid-credentials.exception'
import { BitgoCredentialService } from '../../bitgo-credential.service'
import { BitgoCredentials, BitgoInputCredentials } from '../../bitgo.type'

describe(BitgoCredentialService.name, () => {
  let service: BitgoCredentialService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BitgoCredentialService]
    }).compile()

    service = module.get(BitgoCredentialService)
  })

  describe('parse', () => {
    it('validates and parses raw credentials into typed BitgoCredentials', async () => {
      const validCredentials: BitgoCredentials = {
        apiKey: 'test-api-key',
        walletPassphrase: 'test-wallet-passphrase'
      }

      const result = service.parse(validCredentials)
      expect(result).toStrictEqual(validCredentials)
    })

    it('handles everything being undefined', () => {
      const invalidCredentials = {}

      expect(() => service.parse(invalidCredentials)).not.toThrow()
    })
  })

  describe('build', () => {
    it('transforms input credentials into provider-ready format', async () => {
      const input: BitgoInputCredentials = {
        apiKey: 'test-api-key',
        walletPassphrase: 'test-wallet-passphrase'
      }

      const credentials = await service.build(input)

      expect(credentials).toEqual({
        apiKey: input.apiKey,
        walletPassphrase: input.walletPassphrase
      })
    })

    it('accepts undefined walletPassphrase', async () => {
      const input: BitgoInputCredentials = {
        apiKey: 'test-api-key'
      }

      const credentials = await service.build(input)

      expect(credentials).toEqual({
        apiKey: input.apiKey
      })
    })

    it('throws error when input api key is undefined', async () => {
      const input = {
        apiKey: undefined
      }

      await expect(service.build(input as unknown as BitgoInputCredentials)).rejects.toThrow(
        ConnectionInvalidCredentialsException
      )
    })
  })

  describe('generate', () => {
    it('is a noop & returns empty object', async () => {
      const credentials = await service.generate()

      expect(credentials).toEqual({})
    })
  })
})
