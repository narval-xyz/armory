import { Hex, Request } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { HDKey } from '@scure/bip32'
import { PrivateWallet } from '../../../shared/type/domain.type'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { findBip44Indexes } from '../util/derivation'
import { generateNextPaths, hdKeyToWallet } from '../util/key-generation'
import { SigningService } from './signing.service'

type GenerateArgs = {
  rootKey: HDKey
  keyId: string
  count?: number
  derivationPaths?: string[]
}

@Injectable()
export class WalletService {
  private logger = new Logger(WalletService.name)

  constructor(
    private walletRepository: WalletRepository,
    private signingService: SigningService
  ) {}

  private async getIndexes(clientId: string, keyId: string): Promise<number[]> {
    const wallets = (await this.walletRepository.findByClientId(clientId)).filter((wallet) => wallet.keyId === keyId)
    const indexes = findBip44Indexes(wallets.map((wallet) => wallet.derivationPath))
    return indexes
  }

  async save(clientId: string, wallet: PrivateWallet): Promise<PrivateWallet> {
    return this.walletRepository.save(clientId, wallet)
  }

  async findAll(clientId: string) {
    const wallets = await this.walletRepository.findByClientId(clientId)
    return wallets
  }

  async sign(clientId: string, request: Request): Promise<Hex> {
    return this.signingService.sign(clientId, request)
  }

  async derive(
    clientId: string,
    { rootKey, path, keyId }: { rootKey: HDKey; path: string; keyId: string }
  ): Promise<PrivateWallet> {
    const derivedKey = rootKey.derive(path)
    const wallet = await hdKeyToWallet({
      key: derivedKey,
      keyId,
      path
    })
    const savedWallet = await this.save(clientId, wallet)
    return savedWallet
  }

  async generate(clientId: string, args: GenerateArgs): Promise<PrivateWallet[]> {
    const { keyId, count = 1, derivationPaths = [], rootKey } = args

    const dbIndexes = await this.getIndexes(clientId, keyId)
    const customIndexes = findBip44Indexes(derivationPaths)
    const indexes = [...dbIndexes, ...customIndexes]

    const remainingDerivations = count - derivationPaths.length
    const nextPaths = generateNextPaths(indexes, remainingDerivations)

    const allPaths = [...nextPaths, ...derivationPaths]
    const derivationPromises = allPaths.map(async (path) => this.derive(clientId, { rootKey, path, keyId }))

    const wallets = await Promise.all(derivationPromises)
    return wallets
  }
}
