import {
  Alg,
  Hex,
  ed25519PrivateKeySchema,
  ed25519PublicKeySchema,
  generateJwk,
  getPublicKey,
  privateKeyToHex
} from '@narval/signature'
import { Test } from '@nestjs/testing'
import { ParseException } from '../../../../../../shared/module/persistence/exception/parse.exception'
import '../../../../../shared/__test__/matcher'
import { ConnectionInvalidPrivateKeyException } from '../../../../exception/connection-invalid-private-key.exception'
import { AnchorageCredentialService } from '../../anchorage-credential.service'
import { AnchorageCredentials, AnchorageInputCredentials } from '../../anchorage.type'

describe(AnchorageCredentialService.name, () => {
  let service: AnchorageCredentialService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnchorageCredentialService]
    }).compile()

    service = module.get(AnchorageCredentialService)
  })

  describe('parse', () => {
    it('validates and parses raw credentials into typed AnchorageCredentials', async () => {
      const privateKey = await generateJwk(Alg.EDDSA)
      const validCredentials: AnchorageCredentials = {
        privateKey,
        publicKey: getPublicKey(privateKey),
        apiKey: 'test-api-key'
      }

      const result = service.parse(validCredentials)
      expect(result).toStrictEqual(validCredentials)
    })

    it('throws error when parsing invalid credentials format', () => {
      const invalidCredentials = {
        apiKey: 'test-api-key',
        // Missing required EdDSA key properties
        publicKey: { kty: 'OKP' },
        privateKey: { kty: 'OKP' }
      }

      expect(() => service.parse(invalidCredentials)).toThrow(ParseException)
    })
  })

  describe('build', () => {
    it('transforms input credentials into provider-ready format', async () => {
      const eddsaPrivateKey = await generateJwk(Alg.EDDSA)
      const input: AnchorageInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(eddsaPrivateKey)
      }

      const credentials = await service.build(input)

      expect(credentials).toEqual({
        apiKey: input.apiKey,
        privateKey: eddsaPrivateKey,
        publicKey: getPublicKey(eddsaPrivateKey)
      })
    })

    it('throws error when input private key is invalid', async () => {
      const invalidPrivateKey = 'invalid-key-string'
      const input: AnchorageInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: invalidPrivateKey as Hex
      }

      await expect(service.build(input)).rejects.toThrow(ConnectionInvalidPrivateKeyException)
    })

    it('throws error when input private key is undefined', async () => {
      const input: AnchorageInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: undefined
      }

      await expect(service.build(input)).rejects.toThrow(ConnectionInvalidPrivateKeyException)
    })
  })

  describe('generate', () => {
    it('creates new EdDSA key pair with api credentials', async () => {
      const credentials = await service.generate()

      expect(credentials.publicKey).toMatchZodSchema(ed25519PublicKeySchema)
      expect(credentials.privateKey).toMatchZodSchema(ed25519PrivateKeySchema)
    })
  })
})
