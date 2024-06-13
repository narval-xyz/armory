import { Jwk, RsaKey, hash, rsaEncrypt } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { HDKey } from '@scure/bip32'
import { english, generateMnemonic } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, _OLD_PRIVATE_WALLET_ } from '../../../shared/type/domain.type'
import { DeriveWalletDto } from '../../http/rest/dto/derive-_OLD_WALLET_.dto'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key.dto'
import { BackupRepository } from '../../persistence/repository/backup.repository'
import { RootKeyRepository } from '../../persistence/repository/root-key.repository'
import { WalletRepository } from '../../persistence/repository/_OLD_WALLET_.repository'
import {
  findAddressIndexes,
  generateNextPaths,
  getRootKey,
  hdKeyToWallet,
  mnemonicToRootKey
} from '../util/key-generation.util'

type GenerateArgs = {
  rootKey: HDKey
  keyId: string
  count?: number
  derivationPaths?: string[]
}

@Injectable()
export class KeyGenerationService {
  private logger = new Logger(KeyGenerationService.name)

  constructor(
    private _OLD_WALLET_Repository: WalletRepository,
    private rootKeyRepository: RootKeyRepository,
    private backupRepository: BackupRepository,
    private clientService: ClientService
  ) {}

  async #maybeEncryptAndSaveBackup(
    clientId: string,
    kid: string,
    rootKey: string,
    backupPublicKey?: Jwk
  ): Promise<string | undefined> {
    if (!backupPublicKey) {
      this.logger.log('No backup public key provided', { clientId })
      return
    }

    this.logger.log('Encrypting backup', { clientId })
    const backupPublicKeyHash = hash(backupPublicKey)
    const data = await rsaEncrypt(rootKey, backupPublicKey as RsaKey)

    await this.backupRepository.save(clientId, {
      backupPublicKeyHash,
      keyId: kid,
      data,
      createdAt: new Date()
    })

    return data
  }

  async saveMnemonic(
    clientId: string,
    {
      keyId,
      mnemonic,
      origin
    }: {
      keyId: string
      mnemonic: string
      origin: Origin
    }
  ): Promise<string | undefined> {
    const client = await this.clientService.findById(clientId)
    const lookup = await this.rootKeyRepository.findById(clientId, keyId)

    if (lookup) {
      throw new ApplicationException({
        message: 'Mnemonic already exists',
        suggestedHttpStatusCode: 409,
        context: { clientId, keyId }
      })
    }

    const backup = await this.#maybeEncryptAndSaveBackup(clientId, keyId, mnemonic, client?.backupPublicKey)

    await this.rootKeyRepository.save(clientId, {
      keyId,
      mnemonic,
      origin,
    })

    return backup
  }

  async getIndexes(clientId: string, keyId: string): Promise<number[]> {
    const _OLD_WALLETS_ = (await this._OLD_WALLET_Repository.findByClientId(clientId)).filter((_OLD_WALLET_) => _OLD_WALLET_.keyId === keyId)
    const indexes = findAddressIndexes(_OLD_WALLETS_.map((_OLD_WALLET_) => _OLD_WALLET_.derivationPath))
    return indexes
  }

  async _OLD_WALLET_Derive(
    clientId: string,
    { rootKey, path, keyId }: { rootKey: HDKey; path: string; keyId: string }
  ): Promise<_OLD_PRIVATE_WALLET_> {
    const derivedKey = rootKey.derive(path)
    const _OLD_WALLET_ = await hdKeyToWallet({
      key: derivedKey,
      keyId,
      path
    })
    await this._OLD_WALLET_Repository.save(clientId, _OLD_WALLET_)
    return _OLD_WALLET_
  }

  async generateWallet(clientId: string, args: GenerateArgs): Promise<_OLD_PRIVATE_WALLET_[]> {
    const { keyId, count = 1, derivationPaths = [], rootKey } = args

    const dbIndexes = await this.getIndexes(clientId, keyId)
    const customIndexes = findAddressIndexes(derivationPaths)
    const indexes = [...dbIndexes, ...customIndexes]

    const remainingDerivations = count - derivationPaths.length
    const nextPaths = generateNextPaths(indexes, remainingDerivations)

    const allPaths = [...nextPaths, ...derivationPaths]
    const derivationPromises = allPaths.map((path) => this._OLD_WALLET_Derive(clientId, { rootKey, path, keyId }))
    const _OLD_WALLETS_ = await Promise.all(derivationPromises)
    return _OLD_WALLETS_
  }

  async derive(
    clientId: string,
    { derivationPaths, keyId, count }: DeriveWalletDto
  ): Promise<{ _OLD_WALLETS_: _OLD_PRIVATE_WALLET_[] }> {
    const seed = await this.rootKeyRepository.findById(clientId, keyId)
    if (!seed) {
      throw new ApplicationException({
        message: 'Mnemonic not found',
        suggestedHttpStatusCode: 404,
        context: { clientId, keyId }
      })
    }
    const rootKey = mnemonicToRootKey(seed.mnemonic)

    const _OLD_WALLETS_ = await this.generateWallet(clientId, {
      keyId,
      count,
      rootKey,
      derivationPaths
    })

    return { _OLD_WALLETS_ }
  }

  async generateMnemonic(
    clientId: string,
    opts: GenerateKeyDto
  ): Promise<{
    _OLD_WALLET_: _OLD_PRIVATE_WALLET_
    keyId: string
    backup?: string
  }> {
    this.logger.log('Generating rootKey', { clientId })
    const mnemonic = generateMnemonic(english)

    const { rootKey, keyId } = getRootKey(mnemonic, opts)

    const backup = await this.saveMnemonic(clientId, {
      keyId,
      mnemonic,
      origin: Origin.GENERATED
    })

    this.logger.log('Deriving first _OLD_WALLET_', { clientId })

    const [firstWallet] = await this.generateWallet(clientId, {
      keyId,
      rootKey
    })

    return {
      _OLD_WALLET_: firstWallet,
      keyId,
      backup
    }
  }
}
