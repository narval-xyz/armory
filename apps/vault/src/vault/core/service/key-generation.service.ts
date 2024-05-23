import { Jwk, RsaKey, hash, rsaEncrypt, rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { english, generateMnemonic } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SeedOrigin, Wallet } from '../../../shared/type/domain.type'
import { DeriveWalletDto } from '../../http/rest/dto/derive-wallet-dto'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key-dto'
import { BackupRepository } from '../../persistence/repository/backup.repository'
import { MnemonicRepository } from '../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { deriveWallet, hdKeyToKid, mnemonicToRootKey } from '../util/key-generation'

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
    if (
      rsaPublicKeySchema.safeParse(backupPublicKey).success === false &&
      rsaPrivateKeySchema.safeParse(backupPublicKey).success === false
    ) {
      this.logger.warn('Invalid backup public key provided. Need an RSA key', { clientId })
      return
    }
    this.logger.log('Encrypting backup', { clientId })
    const backupPublicKeyHash = hash(backupPublicKey)
    await this.backupRepository.save(clientId, {
      backupPublicKeyHash,
      keyId: kid,
      data: mnemonic
    })

    const data = await rsaEncrypt(mnemonic, backupPublicKey as RsaKey)
    return data
  }

  async #saveMnemonic(
    clientId: string,
    {
      kid,
      mnemonic,
      origin,
      nextAddrIndex
    }: {
      kid: string
      mnemonic: string
      origin: SeedOrigin
      nextAddrIndex: number
    }
  ): Promise<string | undefined> {
    const client = await this.clientService.findById(clientId)
    const backup = await this.#maybeEncryptAndSaveBackup(clientId, kid, mnemonic, client?.backupPublicKey)

    await this.mnemonicRepository.save(clientId, {
      keyId: kid,
      mnemonic,
      origin,
      nextAddrIndex
    })

    return backup
  }

  async deriveWallet(clientId: string, opts: DeriveWalletDto): Promise<Wallet[] | Wallet> {
    this.logger.log('Deriving wallet', { clientId })
    const rootKey = await this.mnemonicRepository.findById(clientId, opts.keyId)

    if (!rootKey) {
      throw new ApplicationException({
        message: 'Root key not found',
        suggestedHttpStatusCode: 404
      })
    }
    const { mnemonic, nextAddrIndex } = rootKey

    const wallets: Wallet[] = []

    let curr = nextAddrIndex
    for (const path of opts.derivationPaths) {
      let wallet: Wallet
      if (path === 'next') {
        wallet = await deriveWallet(mnemonicToRootKey(mnemonic), { rootKeyId: opts.keyId, addressIndex: curr })
        curr++
      } else {
        wallet = await deriveWallet(mnemonicToRootKey(mnemonic), { rootKeyId: opts.keyId, path })
      }

      wallets.push(wallet)
      await this.walletRepository.save(clientId, wallet)
    }

    if (curr !== nextAddrIndex) {
      await this.mnemonicRepository.save(clientId, {
        keyId: opts.keyId,
        mnemonic,
        origin: SeedOrigin.IMPORTED,
        nextAddrIndex: curr
      })
    }

    return wallets.length === 1 ? wallets[0] : wallets
  }

  async storeRootKeyAndFirstWallet(
    clientId: string,
    { mnemonic, keyId, origin }: { mnemonic: string; keyId?: string; origin: SeedOrigin }
  ): Promise<{
    wallet: Wallet
    rootKeyId: string
    backup?: string
  }> {
    const rootKey = mnemonicToRootKey(mnemonic)

    const rootKeyId = keyId || hdKeyToKid(rootKey)

    const backup = await this.#saveMnemonic(clientId, {
      kid: rootKeyId,
      mnemonic,
      origin,
      nextAddrIndex: 1
    })

    this.logger.log('Deriving first wallet', { clientId })
    const firstWallet = await deriveWallet(rootKey, { rootKeyId })
    await this.walletRepository.save(clientId, firstWallet)

    return {
      wallet: firstWallet,
      rootKeyId,
      backup
    }
  }

  async generateMnemonic(
    clientId: string,
    opts: GenerateKeyDto
  ): Promise<{
    wallet: Wallet
    rootKeyId: string
    backup?: string
  }> {
    this.logger.log('Generating mnemonic', { clientId })
    const mnemonic = generateMnemonic(english)

    const res = await this.storeRootKeyAndFirstWallet(clientId, {
      mnemonic,
      keyId: opts.keyId,
      origin: SeedOrigin.GENERATED
    })
    return res
  }
}
