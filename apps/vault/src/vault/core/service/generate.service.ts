import { Jwk, RsaKey, hash, rsaEncrypt, rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { english, generateMnemonic } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { Wallet } from '../../../shared/type/domain.type'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key-dto'
import { BackupRepository } from '../../persistence/repository/backup.repository'
import { MnemonicRepository } from '../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { deriveWallet, hdKeyToKid, mnemonicToRootKey } from '../utils/key-generation'

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

  async #saveMnemonic(clientId: string, kid: string, mnemonic: string): Promise<string | undefined> {
    const client = await this.clientService.findById(clientId)
    const backup = await this.#maybeEncryptAndSaveBackup(clientId, kid, mnemonic, client?.backupPublicKey)

    await this.mnemonicRepository.save(clientId, {
      keyId: kid,
      mnemonic
    })
    return backup
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
    const rootKey = mnemonicToRootKey(mnemonic)

    const rootKeyId = opts.keyId || hdKeyToKid(rootKey)

    const backup = await this.#saveMnemonic(clientId, rootKeyId, mnemonic)

    this.logger.log('Deriving first wallet', { clientId })
    const firstWallet = await deriveWallet(rootKey, { rootKeyId })
    await this.walletRepository.save(clientId, firstWallet)

    return {
      wallet: firstWallet,
      rootKeyId,
      backup
    }
  }
}
