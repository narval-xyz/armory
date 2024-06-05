import { Hex } from '@narval/policy-engine-shared'
import {
  Alg,
  RsaPrivateKey,
  RsaPublicKey,
  generateJwk,
  privateKeyToJwk,
  publicKeyToHex,
  rsaDecrypt,
  rsaPrivateKeyToPublicKey
} from '@narval/signature'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { decodeProtectedHeader } from 'jose'
import { isHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateWallet } from '../../../shared/type/domain.type'
import { ImportSeedDto } from '../../http/rest/dto/import-seed-dto'
import { ImportRepository } from '../../persistence/repository/import.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { deriveWallet, getRootKey } from '../util/key-generation'
import { KeyGenerationService } from './key-generation.service'
import { nextBip44Path } from 'apps/vault/src/vault/core/util/derivation'

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name)

  constructor(
    private walletRepository: WalletRepository,
    private importRepository: ImportRepository,
    private keyGenerationService: KeyGenerationService
  ) {}

  async generateEncryptionKey(clientId: string): Promise<RsaPublicKey> {
    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc' })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)

    // Save the privateKey
    await this.importRepository.save(clientId, privateKey)

    return publicKey
  }

  async importPrivateKey(clientId: string, privateKey: Hex, walletId?: string): Promise<PrivateWallet> {
    this.logger.log('Importing private key', {
      clientId
    })
    const address = privateKeyToAddress(privateKey)
    const id = walletId || this.generateWalletId(address)
    const publicKey = await publicKeyToHex(privateKeyToJwk(privateKey))
    const wallet = await this.walletRepository.save(clientId, {
      id,
      privateKey,
      origin: Origin.IMPORTED,
      publicKey,
      address
    })

    return wallet
  }

  async #decrypt(clientId: string, encryptedData: string): Promise<string> {
    const header = decodeProtectedHeader(encryptedData)
    const kid = header.kid

    if (!kid) {
      throw new ApplicationException({
        message: 'Missing kid in JWE header',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    const encryptionPrivateKey = await this.importRepository.findById(clientId, kid)

    if (!encryptionPrivateKey) {
      throw new ApplicationException({
        message: 'Encryption Key Not Found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    return rsaDecrypt(encryptedData, encryptionPrivateKey.jwk)
  }

  async importEncryptedPrivateKey(
    clientId: string,
    encryptedPrivateKey: string,
    walletId?: string
  ): Promise<PrivateWallet> {
    this.logger.log('Importing encrypted private key', {
      clientId
    })

    const privateKey = await this.#decrypt(clientId, encryptedPrivateKey)

    if (!isHex(privateKey)) {
      throw new ApplicationException({
        message: 'Invalid decrypted private key; must be hex string with 0x prefix',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    this.logger.log('Decrypted private key', {
      clientId
    })

    return this.importPrivateKey(clientId, privateKey as Hex, walletId)
  }

  async importSeed(
    clientId: string,
    body: ImportSeedDto
  ): Promise<{
    wallet: PrivateWallet
    keyId: string
    backup?: string
  }> {
    const { keyId, encryptedSeed } = body

    const mnemonic = await this.#decrypt(clientId, encryptedSeed)

    const { rootKey, keyId: rootKeyId } = getRootKey(mnemonic, keyId)

    const backup = await this.keyGenerationService.saveMnemonic(clientId, {
      kid: rootKeyId,
      mnemonic,
      origin: Origin.IMPORTED,
    })

    const firstWallet = await deriveWallet(rootKey, { rootKeyId })

    return {
      wallet: firstWallet,
      keyId: rootKeyId,
      backup
    }
  }

  generateWalletId(address: Hex): string {
    return `eip155:eoa:${address.toLowerCase()}`
  }
}
