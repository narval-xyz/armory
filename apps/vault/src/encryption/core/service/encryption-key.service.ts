import { Alg, RsaPrivateKey, generateJwk, rsaDecrypt, rsaPrivateKeyToPublicKey } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { decodeProtectedHeader } from 'jose'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { EncryptionKeyRepository } from '../../persistence/encryption-key.repository'
import { EncryptionKey } from '../type/encryption-key.type'

const DEFAULT_RSA_MODULUS_LENGTH = 4096

@Injectable()
export class EncryptionKeyService {
  constructor(private readonly encryptionKeyRepository: EncryptionKeyRepository) {}

  async generate(clientId: string, opts?: { modulusLenght?: number }): Promise<EncryptionKey> {
    const modulusLength = opts?.modulusLenght || DEFAULT_RSA_MODULUS_LENGTH
    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc', modulusLength })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)
    const encryptionKey = {
      clientId,
      privateKey,
      publicKey,
      createdAt: new Date()
    }

    return this.encryptionKeyRepository.create(encryptionKey)
  }

  async decrypt(clientId: string, data: string): Promise<string> {
    const header = decodeProtectedHeader(data)
    const kid = header.kid

    if (!kid) {
      throw new ApplicationException({
        message: 'Missing kid in JWE header',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    const encryptionKey = await this.encryptionKeyRepository.findByKid(kid)

    if (encryptionKey) {
      if (encryptionKey.clientId !== clientId) {
        throw new ApplicationException({
          message: "Encryption key doesn't belong to client",
          suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
        })
      }

      return rsaDecrypt(data, encryptionKey.privateKey)
    }

    throw new ApplicationException({
      message: 'Encryption key not found',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND
    })
  }
}
