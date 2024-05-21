import { Logger } from '@nestjs/common'
import { english, generateMnemonic } from 'viem/accounts'
import { Wallet } from '../../../shared/type/domain.type'
import { GenerateKeyDto } from '../../http/rest/dto/generate-key-dto'
import { MnemonicRepository } from '../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { mnemonicToWallet } from '../utils/key-generation'

export class KeyGenerationService {
  private logger = new Logger(KeyGenerationService.name)

  constructor(
    private walletRepository: WalletRepository,

    private mnemonicRepository: MnemonicRepository
  ) {}

  async generateMnemonic(clientId: string, opts: GenerateKeyDto): Promise<Wallet> {
    const mnemonic = generateMnemonic(english)

    this.logger.log(`Generated mnemonic for client ${clientId}`)
    this.logger.log(`Mnemonic: ${mnemonic}`)
    this.logger.log(`Opts: ${opts}`)

    const wallet = mnemonicToWallet(mnemonic)
    return wallet
  }
}
