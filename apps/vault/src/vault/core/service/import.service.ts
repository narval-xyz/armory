import { resourceId } from '@narval/armory-sdk'
import { LoggerService, MetricService, OTEL_ATTR_CLIENT_ID } from '@narval/nestjs-shared'
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
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { decodeProtectedHeader } from 'jose'
import { isHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateAccount } from '../../../shared/type/domain.type'
import { ImportWalletDto } from '../../http/rest/dto/import-wallet.dto'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { ImportRepository } from '../../persistence/repository/import.repository'
import { getRootKey } from '../util/key-generation.util'
import { KeyGenerationService } from './key-generation.service'

@Injectable()
export class ImportService {
  private walletImportCounter: Counter

  private accountImportCounter: Counter

  constructor(
    private accountRepository: AccountRepository,
    private importRepository: ImportRepository,
    private keyGenerationService: KeyGenerationService,
    private logger: LoggerService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    this.walletImportCounter = this.metricService.createCounter('wallet_import_count')
    this.accountImportCounter = this.metricService.createCounter('account_import_count')
  }

  async generateEncryptionKey(clientId: string): Promise<RsaPublicKey> {
    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc' })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)

    // Save the privateKey
    await this.importRepository.save(clientId, privateKey)

    return publicKey
  }

  async importPrivateKey(clientId: string, privateKey: Hex, accountId?: string): Promise<PrivateAccount> {
    this.logger.log('Importing private key', {
      clientId
    })
    this.accountImportCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const address = privateKeyToAddress(privateKey)
    const id = accountId || resourceId(address)
    const publicKey = await publicKeyToHex(privateKeyToJwk(privateKey))
    const account = await this.accountRepository.save(clientId, {
      id,
      privateKey,
      origin: Origin.IMPORTED,
      publicKey,
      address
    })

    return account
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
    accountId?: string
  ): Promise<PrivateAccount> {
    this.logger.log('Importing encrypted private key', {
      clientId
    })
    // TODO: (@wcalderipe, 13/11/2024) Add unit test to ensure we're tracking
    // the business metrics.
    this.accountImportCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

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

    return this.importPrivateKey(clientId, privateKey as Hex, accountId)
  }

  async importSeed(
    clientId: string,
    body: ImportWalletDto
  ): Promise<{
    account: PrivateAccount
    keyId: string
    backup?: string
  }> {
    // TODO: (@wcalderipe, 13/11/2024) Add unit test to ensure we're tracking
    // the business metrics.
    this.walletImportCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const { keyId: optionalKeyId, encryptedSeed, curve } = body

    const mnemonic = await this.#decrypt(clientId, encryptedSeed)

    const { rootKey, keyId } = getRootKey(mnemonic, { curve, keyId: optionalKeyId })

    const backup = await this.keyGenerationService.saveMnemonic(clientId, {
      keyId,
      mnemonic,
      origin: Origin.IMPORTED,
      curve: body.curve
    })

    const [account] = await this.keyGenerationService.generateAccount(clientId, { rootKey, keyId })

    return {
      account,
      keyId,
      backup
    }
  }
}
