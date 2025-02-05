import {
  Alg,
  SMALLEST_RSA_MODULUS_LENGTH,
  generateJwk,
  getPublicKey,
  privateKeyToPem,
  rsaPrivateKeySchema,
  rsaPublicKeySchema
} from '@narval/signature'
import { Test } from '@nestjs/testing'
import { ParseException } from '../../../../../../shared/module/persistence/exception/parse.exception'
import '../../../../../shared/__test__/matcher'
import { ConnectionInvalidPrivateKeyException } from '../../../../exception/connection-invalid-private-key.exception'
import { FireblocksCredentialService } from '../../fireblocks-credential.service'
import { FireblocksCredentials, FireblocksInputCredentials } from '../../fireblocks.type'

describe('FireblocksCredentialService', () => {
  let service: FireblocksCredentialService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FireblocksCredentialService]
    }).compile()

    service = module.get(FireblocksCredentialService)
  })

  describe('parse', () => {
    it('validates and parses raw credentials into typed FireblocksCredentials', async () => {
      const privateKey = await generateJwk(Alg.RS256, { modulusLength: SMALLEST_RSA_MODULUS_LENGTH })
      const validCredentials: FireblocksCredentials = {
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
        // Missing required RSA key properties
        publicKey: { kty: 'RSA' },
        privateKey: { kty: 'RSA' }
      }

      expect(() => service.parse(invalidCredentials)).toThrow(ParseException)
    })
  })

  describe('build', () => {
    it('transforms input credentials into provider-ready format', async () => {
      const rsaPrivateKey = await generateJwk(Alg.RS256, { modulusLength: SMALLEST_RSA_MODULUS_LENGTH })
      const pem = await privateKeyToPem(rsaPrivateKey, Alg.RS256)
      const input: FireblocksInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: Buffer.from(pem).toString('base64')
      }

      const credentials = await service.build(input)

      expect(credentials).toEqual({
        apiKey: input.apiKey,
        privateKey: rsaPrivateKey,
        publicKey: getPublicKey(rsaPrivateKey)
      })
    })

    it('throws error when input private key is invalid', async () => {
      const invalidPrivateKey = 'invalid-base64-string'
      const input: FireblocksInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: invalidPrivateKey
      }

      await expect(service.build(input)).rejects.toThrow(ConnectionInvalidPrivateKeyException)
    })

    it('throws error when input private key is undefined', async () => {
      const input: FireblocksInputCredentials = {
        apiKey: 'test-api-key',
        privateKey: undefined
      }

      await expect(service.build(input)).rejects.toThrow(ConnectionInvalidPrivateKeyException)
    })
  })

  describe('generate', () => {
    it('creates new RSA key pair with api credentials', async () => {
      const credentials = await service.generate({ modulusLength: SMALLEST_RSA_MODULUS_LENGTH })

      expect(credentials.publicKey).toMatchZodSchema(rsaPublicKeySchema)
      expect(credentials.privateKey).toMatchZodSchema(rsaPrivateKeySchema)
    })
  })
})
