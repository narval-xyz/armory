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
import { resourceId } from 'packages/armory-sdk/src/lib/utils/domain'
import { isHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateWallet } from '../../../shared/type/domain.type'
import { ImportSeedDto } from '../../http/rest/dto/import-seed-dto'
import { ImportRepository } from '../../persistence/repository/import.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { getRootKey } from '../util/key-generation'
import { SeedService } from './seed.service'
import { WalletService } from './wallet.service'

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name)

  constructor(
    private walletRepository: WalletRepository,
    private importRepository: ImportRepository,
    private keyGenerationService: SeedService,
    private walletService: WalletService
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
    const id = walletId || resourceId(address)
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

  private async decrypt(clientId: string, encryptedData: string): Promise<string> {
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

    const privateKey = await this.decrypt(clientId, encryptedPrivateKey)

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
    const { keyId: optionalId, encryptedSeed } = body

    const mnemonic = await this.decrypt(clientId, encryptedSeed)

    const { rootKey, keyId } = getRootKey(mnemonic, {
      keyId: optionalId
    })

    const backup = await this.keyGenerationService.save(clientId, {
      kid: keyId,
      mnemonic,
      origin: Origin.IMPORTED
    })

    const [firstWallet] = await this.walletService.generate(clientId, {
      keyId,
      rootKey
    })

    return {
      wallet: firstWallet,
      keyId: keyId,
      backup
    }
  }
}
