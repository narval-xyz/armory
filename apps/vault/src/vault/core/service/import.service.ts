import { Hex } from '@narval/policy-engine-shared'
import { Alg, RsaPrivateKey, RsaPublicKey, generateJwk, rsaPrivateKeyToPublicKey } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { privateKeyToAddress } from 'viem/accounts'
import { Wallet } from '../../../shared/type/domain.type'
import { ImportRepository } from '../../persistence/repository/import.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name)

  constructor(
    private walletRepository: WalletRepository,
    private importRepository: ImportRepository
  ) {}

  async generateEncryptionKey(clientId: string): Promise<RsaPublicKey> {
    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc' })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)

    // Save the privateKey
    await this.importRepository.save(clientId, privateKey)

    return publicKey
  }

  async importPrivateKey(clientId: string, privateKey: Hex, walletId?: string): Promise<Wallet> {
    this.logger.log('Importing private key', {
      clientId
    })
    const address = privateKeyToAddress(privateKey)
    const id = walletId || this.generateWalletId(address)

    const wallet = await this.walletRepository.save(clientId, {
      id,
      privateKey,
      address
    })

    return wallet
  }

  generateWalletId(address: Hex): string {
    return `eip155:eoa:${address.toLowerCase()}`
  }
}
