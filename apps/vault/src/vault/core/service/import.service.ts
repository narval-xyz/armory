import { resourceId } from '@narval/armory-sdk'
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
import { Origin, _OLD_PRIVATE_WALLET_ } from '../../../shared/type/domain.type'
import { ImportSeedDto } from '../../http/rest/dto/import-seed.dto'
import { ImportRepository } from '../../persistence/repository/import.repository'
import { WalletRepository } from '../../persistence/repository/_OLD_WALLET_.repository'
import { getRootKey } from '../util/key-generation.util'
import { KeyGenerationService } from './key-generation.service'

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name)

  constructor(
    private _OLD_WALLET_Repository: WalletRepository,
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

  async importPrivateKey(clientId: string, privateKey: Hex, _OLD_WALLET_Id?: string): Promise<_OLD_PRIVATE_WALLET_> {
    this.logger.log('Importing private key', {
      clientId
    })
    const address = privateKeyToAddress(privateKey)
    const id = _OLD_WALLET_Id || resourceId(address)
    const publicKey = await publicKeyToHex(privateKeyToJwk(privateKey))
    const _OLD_WALLET_ = await this._OLD_WALLET_Repository.save(clientId, {
      id,
      privateKey,
      origin: Origin.IMPORTED,
      publicKey,
      address
    })

    return _OLD_WALLET_
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
    _OLD_WALLET_Id?: string
  ): Promise<_OLD_PRIVATE_WALLET_> {
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

    return this.importPrivateKey(clientId, privateKey as Hex, _OLD_WALLET_Id)
  }

  async importSeed(
    clientId: string,
    body: ImportSeedDto
  ): Promise<{
    _OLD_WALLET_: _OLD_PRIVATE_WALLET_
    keyId: string
    backup?: string
  }> {
    const { keyId: optionalKeyId, encryptedSeed } = body

    const mnemonic = await this.#decrypt(clientId, encryptedSeed)

    const { rootKey, keyId } = getRootKey(mnemonic, { keyId: optionalKeyId })

    const backup = await this.keyGenerationService.saveMnemonic(clientId, {
      keyId,
      mnemonic,
      origin: Origin.IMPORTED
    })

    const [_OLD_WALLET_] = await this.keyGenerationService.generate(clientId, { rootKey, keyId })

    return {
      _OLD_WALLET_,
      keyId,
      backup
    }
  }
}
