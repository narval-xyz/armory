import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import {
  Alg,
  DEFAULT_RSA_MODULUS_LENGTH,
  RsaPrivateKey,
  SMALLEST_RSA_MODULUS_LENGTH,
  generateJwk,
  rsaDecrypt,
  rsaPrivateKeyToPublicKey
} from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { decodeProtectedHeader } from 'jose'
import { Config, Env } from '../../../main.config'
import { EncryptionKeyRepository } from '../../persistence/encryption-key.repository'
import { InvalidJweHeaderException } from '../exception/invalid-jwe-header.exception'
import { NotFoundException } from '../exception/not-found.exception'
import { UnauthorizedException } from '../exception/unauthorized.exception'
import { EncryptionKey } from '../type/encryption-key.type'

type GenerateOptions = {
  modulusLength?: number
}

@Injectable()
export class EncryptionKeyService {
  constructor(
    private readonly encryptionKeyRepository: EncryptionKeyRepository,
    private readonly configService: ConfigService<Config>,
    private readonly logger: LoggerService
  ) {}

  async generate(clientId: string, opts?: GenerateOptions): Promise<EncryptionKey> {
    const modulusLength = this.getRsaModulusLength(opts)
    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc', modulusLength })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)

    this.logger.log('Generate RSA encryption key', {
      clientId,
      modulusLength,
      keyId: publicKey.kid
    })

    const encryptionKey = {
      clientId,
      privateKey,
      publicKey,
      createdAt: new Date()
    }

    return this.encryptionKeyRepository.create(encryptionKey)
  }

  private getRsaModulusLength(opts?: GenerateOptions): number {
    if (opts?.modulusLength) {
      return opts.modulusLength
    }

    // Prevents flaky tests due to the high time it takes to generate an RSA
    // key 4096.
    if (this.configService.get('env') !== Env.PRODUCTION) {
      return SMALLEST_RSA_MODULUS_LENGTH
    }

    return DEFAULT_RSA_MODULUS_LENGTH
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
