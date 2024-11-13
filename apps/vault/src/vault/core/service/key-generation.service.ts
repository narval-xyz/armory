import { LoggerService, MetricService, OTEL_ATTR_CLIENT_ID } from '@narval/nestjs-shared'
import { Jwk, RsaKey, hash, rsaEncrypt } from '@narval/signature'
import { Inject, Injectable } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { HDKey } from '@scure/bip32'
import { english, generateMnemonic } from 'viem/accounts'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Curve, Origin, PrivateAccount } from '../../../shared/type/domain.type'
import { DeriveAccountDto } from '../../http/rest/dto/derive-account.dto'
import { GenerateWalletDto } from '../../http/rest/dto/generate-wallet.dto'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { BackupRepository } from '../../persistence/repository/backup.repository'
import { RootKeyRepository } from '../../persistence/repository/root-key.repository'
import {
  findAddressIndexes,
  generateNextPaths,
  getRootKey,
  hdKeyToAccount,
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
  private walletGenerateCounter: Counter
  private accountGenerateCounter: Counter
  private accountDeriveCounter: Counter

  constructor(
    private accountRepository: AccountRepository,
    private rootKeyRepository: RootKeyRepository,
    private backupRepository: BackupRepository,
    private clientService: ClientService,
    private logger: LoggerService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    this.walletGenerateCounter = this.metricService.createCounter('wallet_generate_count')
    this.accountGenerateCounter = this.metricService.createCounter('account_generate_count')
    this.accountDeriveCounter = this.metricService.createCounter('account_derive_count')
  }

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
      origin,
      curve
    }: {
      keyId: string
      mnemonic: string
      origin: Origin
      curve: Curve
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
      keyType: 'local',
      curve
    })

    return backup
  }

  async getIndexes(clientId: string, keyId: string): Promise<number[]> {
    const accounts = (await this.accountRepository.findByClientId(clientId)).filter(
      (account) => account.keyId === keyId
    )
    const indexes = findAddressIndexes(accounts.map((account) => account.derivationPath))
    return indexes
  }

  async accountDerive(
    clientId: string,
    { rootKey, path, keyId }: { rootKey: HDKey; path: string; keyId: string }
  ): Promise<PrivateAccount> {
    this.accountDeriveCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const derivedKey = rootKey.derive(path)
    const account = await hdKeyToAccount({
      key: derivedKey,
      keyId,
      path
    })

    await this.accountRepository.save(clientId, account)

    return account
  }

  async generateAccount(clientId: string, args: GenerateArgs): Promise<PrivateAccount[]> {
    this.accountGenerateCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const { keyId, count = 1, derivationPaths = [], rootKey } = args

    const dbIndexes = await this.getIndexes(clientId, keyId)
    const customIndexes = findAddressIndexes(derivationPaths)
    const indexes = [...dbIndexes, ...customIndexes]

    const remainingDerivations = count - derivationPaths.length
    const nextPaths = remainingDerivations > 0 ? generateNextPaths(indexes, remainingDerivations) : []

    const allPaths = [...nextPaths, ...derivationPaths]
    const derivationPromises = allPaths.map((path) => this.accountDerive(clientId, { rootKey, path, keyId }))
    const accounts = await Promise.all(derivationPromises)
    return accounts
  }

  async derive(
    clientId: string,
    { derivationPaths, keyId, count }: DeriveAccountDto
  ): Promise<{ accounts: PrivateAccount[] }> {
    this.accountDeriveCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const seed = await this.rootKeyRepository.findById(clientId, keyId)
    if (!seed) {
      throw new ApplicationException({
        message: 'Root Key not found',
        suggestedHttpStatusCode: 404,
        context: { clientId, keyId }
      })
    }
    if (seed.keyType !== 'local') {
      throw new ApplicationException({
        message: 'Cannot derive accounts from remote key',
        suggestedHttpStatusCode: 400,
        context: { clientId, keyId }
      })
    }
    const rootKey = mnemonicToRootKey(seed.mnemonic)

    const accounts = await this.generateAccount(clientId, {
      keyId,
      count,
      rootKey,
      derivationPaths
    })

    return { accounts }
  }

  async generateWallet(
    clientId: string,
    opts: GenerateWalletDto
  ): Promise<{
    account: PrivateAccount
    keyId: string
    backup?: string
  }> {
    this.logger.log('Generating rootKey', { clientId })
    this.walletGenerateCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const mnemonic = generateMnemonic(english)

    const { rootKey, keyId } = getRootKey(mnemonic, opts)

    const backup = await this.saveMnemonic(clientId, {
      keyId,
      mnemonic,
      origin: Origin.GENERATED,
      curve: opts.curve
    })

    this.logger.log('Deriving first account', { clientId })

    const [firstAccount] = await this.generateAccount(clientId, {
      keyId,
      rootKey
    })

    return {
      account: firstAccount,
      keyId,
      backup
    }
  }
}
