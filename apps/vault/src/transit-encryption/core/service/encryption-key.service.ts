import {
  Alg,
  DEFAULT_RSA_MODULUS_LENGTH,
  RsaPrivateKey,
  generateJwk,
  rsaDecrypt,
  rsaPrivateKeyToPublicKey
} from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { decodeProtectedHeader } from 'jose'
import { EncryptionKeyRepository } from '../../persistence/encryption-key.repository'
import { InvalidJweHeaderException } from '../exception/invalid-jwe-header.exception'
import { NotFoundException } from '../exception/not-found.exception'
import { UnauthorizedException } from '../exception/unauthorized.exception'
import { EncryptionKey } from '../type/encryption-key.type'

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

  async decrypt(clientId: string, encryptedData: string): Promise<string> {
    const header = decodeProtectedHeader(encryptedData)
    const kid = header.kid

    if (!kid) {
      throw new InvalidJweHeaderException()
    }

    const encryptionKey = await this.encryptionKeyRepository.findByKid(kid)

    if (encryptionKey) {
      if (encryptionKey.clientId !== clientId) {
        throw new UnauthorizedException({ context: { kid, clientId } })
      }

      return rsaDecrypt(encryptedData, encryptionKey.privateKey)
    }

    throw new NotFoundException({ context: { kid } })
  }
}
