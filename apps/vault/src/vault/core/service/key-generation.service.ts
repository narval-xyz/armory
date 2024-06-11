import { Jwk, RsaKey, hash, rsaEncrypt } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { HDKey } from '@scure/bip32'
import { english, generateMnemonic } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateWallet } from '../../../shared/type/domain.type'
import { DeriveWalletDto } from '../../http/rest/dto/derive-wallet.dto'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key.dto'
import { BackupRepository } from '../../persistence/repository/backup.repository'
import { MnemonicRepository } from '../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
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
    private walletRepository: WalletRepository,
    private mnemonicRepository: MnemonicRepository,
    private backupRepository: BackupRepository,
    private clientService: ClientService
  ) {}

  async #maybeEncryptAndSaveBackup(
    clientId: string,
    kid: string,
    mnemonic: string,
    backupPublicKey?: Jwk
  ): Promise<string | undefined> {
    if (!backupPublicKey) {
      this.logger.log('No backup public key provided', { clientId })
      return
    }

    this.logger.log('Encrypting backup', { clientId })
    const backupPublicKeyHash = hash(backupPublicKey)
    const data = await rsaEncrypt(mnemonic, backupPublicKey as RsaKey)

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
    const backup = await this.#maybeEncryptAndSaveBackup(clientId, keyId, mnemonic, client?.backupPublicKey)

    await this.mnemonicRepository.save(clientId, {
      keyId,
      mnemonic,
      origin
    })

    return backup
  }

  async getIndexes(clientId: string, keyId: string): Promise<number[]> {
    const wallets = (await this.walletRepository.findByClientId(clientId)).filter((wallet) => wallet.keyId === keyId)
    const indexes = findAddressIndexes(wallets.map((wallet) => wallet.derivationPath))
    return indexes
  }

  async walletDerive(
    clientId: string,
    { rootKey, path, keyId }: { rootKey: HDKey; path: string; keyId: string }
  ): Promise<PrivateWallet> {
    const derivedKey = rootKey.derive(path)
    const wallet = await hdKeyToWallet({
      key: derivedKey,
      keyId,
      path
    })
    await this.walletRepository.save(clientId, wallet)
    return wallet
  }

  async generate(clientId: string, args: GenerateArgs): Promise<PrivateWallet[]> {
    const { keyId, count = 1, derivationPaths = [], rootKey } = args

    const dbIndexes = await this.getIndexes(clientId, keyId)
    const customIndexes = findAddressIndexes(derivationPaths)
    const indexes = [...dbIndexes, ...customIndexes]

    const remainingDerivations = count - derivationPaths.length
    const nextPaths = generateNextPaths(indexes, remainingDerivations)

    const allPaths = [...nextPaths, ...derivationPaths]
    const derivationPromises = allPaths.map((path) => this.walletDerive(clientId, { rootKey, path, keyId }))
    const wallets = await Promise.all(derivationPromises)
    return wallets
  }

  async derive(
    clientId: string,
    { derivationPaths, keyId, count }: DeriveWalletDto
  ): Promise<{ wallets: PrivateWallet[] }> {
    const seed = await this.mnemonicRepository.findById(clientId, keyId)
    if (!seed) {
      throw new ApplicationException({
        message: 'Mnemonic not found',
        suggestedHttpStatusCode: 404,
        context: { clientId, keyId }
      })
    }
    const rootKey = mnemonicToRootKey(seed.mnemonic)

    const wallets = await this.generate(clientId, {
      keyId,
      count,
      rootKey,
      derivationPaths
    })

    return { wallets }
  }

  async generateMnemonic(
    clientId: string,
    opts: GenerateKeyDto
  ): Promise<{
    wallet: PrivateWallet
    keyId: string
    backup?: string
  }> {
    this.logger.log('Generating mnemonic', { clientId })
    const mnemonic = generateMnemonic(english)

    const { rootKey, keyId } = getRootKey(mnemonic, opts)

    const backup = await this.saveMnemonic(clientId, {
      keyId,
      mnemonic,
      origin: Origin.GENERATED
    })

    this.logger.log('Deriving first wallet', { clientId })

    const [firstWallet] = await this.generate(clientId, {
      keyId,
      rootKey
    })

    return {
      wallet: firstWallet,
      keyId,
      backup
    }
  }
}
