import { Injectable, Logger } from '@nestjs/common'
import { english, generateMnemonic } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateWallet } from '../../../shared/type/domain.type'
import { DeriveWalletDto } from '../../http/rest/dto/derive-wallet.dto'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key-dto'
import { SeedRepository } from '../../persistence/repository/mnemonic.repository'
import { getRootKey, mnemonicToRootKey } from '../util/key-generation'
import { BackupService } from './backup.service'
import { WalletService } from './wallet.service'

@Injectable()
export class SeedService {
  private logger = new Logger(SeedService.name)

  constructor(
    private walletService: WalletService,
    private seedRepository: SeedRepository,
    private backupService: BackupService
  ) {}

  async save(
    clientId: string,
    {
      kid,
      mnemonic,
      origin
    }: {
      kid: string
      mnemonic: string
      origin: Origin
    }
  ): Promise<string | undefined> {
    await this.seedRepository.save(clientId, {
      keyId: kid,
      mnemonic,
      origin
    })
    const data = this.backupService.tryBackup(clientId, mnemonic)
    return data
  }

  async derive(
    clientId: string,
    { derivationPaths, keyId, count }: DeriveWalletDto
  ): Promise<{ wallets: PrivateWallet[] }> {
    const seed = await this.seedRepository.findById(clientId, keyId)
    if (!seed) {
      throw new ApplicationException({
        message: 'Mnemonic not found',
        suggestedHttpStatusCode: 404,
        context: { clientId, keyId }
      })
    }
    const rootKey = mnemonicToRootKey(seed.mnemonic)

    const wallets = await this.walletService.generate(clientId, {
      keyId,
      count,
      rootKey,
      derivationPaths
    })

    return { wallets }
  }

  async generate(
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

    const backup = await this.save(clientId, {
      kid: keyId,
      mnemonic,
      origin: Origin.GENERATED
    })

    this.logger.log('Deriving first wallet', { clientId })

    const [firstWallet] = await this.walletService.generate(clientId, {
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
