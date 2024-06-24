import { AccessToken } from '@narval/policy-engine-shared'
import { RsaPublicKey, rsaEncrypt } from '@narval/signature'
import axios from 'axios'
import {
  AccountApiFactory,
  AccountDto,
  ClientApiFactory,
  ClientDto,
  Configuration,
  CreateClientDto,
  DeriveAccountDto,
  DeriveAccountResponseDto,
  EncryptionKeyApiFactory,
  GenerateWalletDto,
  ImportPrivateKeyDto,
  ImportWalletDto,
  WalletApiFactory,
  WalletDto,
  WalletsDto
} from '../http/client/vault'
import { getBearerToken, interceptRequestAddDetachedJwsHeader } from '../shared/gnap'
import { AccountHttp, ClientHttp, EncryptionKeyHttp, VaultAdminConfig, VaultConfig, WalletHttp } from './type'

export class VaultAdminClient {
  private config: VaultAdminConfig

  private clientHttp: ClientHttp

  constructor(config: VaultAdminConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = config
    this.clientHttp = ClientApiFactory(httpConfig, config.host, axiosInstance)
  }

  async createClient(input: CreateClientDto): Promise<ClientDto> {
    const { data } = await this.clientHttp.create(this.config.adminApiKey, input)

    return data
  }
}

export class VaultClient {
  private config: VaultConfig

  private encryptionKeyHttp: EncryptionKeyHttp

  private walletHttp: WalletHttp

  private accountHttp: AccountHttp

  constructor(config: VaultConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    axiosInstance.interceptors.request.use(interceptRequestAddDetachedJwsHeader(config.signer))

    this.config = config
    this.walletHttp = WalletApiFactory(httpConfig, config.host, axiosInstance)
    this.encryptionKeyHttp = EncryptionKeyApiFactory(httpConfig, config.host, axiosInstance)
    this.accountHttp = AccountApiFactory(httpConfig, config.host, axiosInstance)
  }

  async generateEncryptionKey({ accessToken }: { accessToken: AccessToken }): Promise<RsaPublicKey> {
    const token = getBearerToken(accessToken)

    const { data: encryptionKey } = await this.encryptionKeyHttp.generate(this.config.clientId, token)

    return encryptionKey.publicKey
  }

  async generateWallet({
    data,
    accessToken
  }: {
    data?: GenerateWalletDto
    accessToken: AccessToken
  }): Promise<WalletDto> {
    const payload = data || {}
    const token = getBearerToken(accessToken)

    const { data: wallet } = await this.walletHttp.generate(this.config.clientId, token, payload)

    return wallet
  }

  async importWallet({
    data,
    encryptionKey,
    accessToken
  }: {
    data: Omit<ImportWalletDto, 'encryptedSeed'> & { seed: string }
    encryptionKey: RsaPublicKey
    accessToken: AccessToken
  }): Promise<WalletDto> {
    const token = getBearerToken(accessToken)
    const { seed, ...options } = data
    const encryptedSeed = await rsaEncrypt(seed, encryptionKey)
    const payload = { ...options, encryptedSeed }

    const { data: wallet } = await this.walletHttp.importSeed(this.config.clientId, token, payload)

    return wallet
  }

  async listWallets({ accessToken }: { accessToken: AccessToken }): Promise<WalletsDto> {
    const token = getBearerToken(accessToken)

    const { data: wallets } = await this.walletHttp.list(this.config.clientId, token)

    return wallets
  }

  async deriveAccounts({
    data,
    accessToken
  }: {
    data: DeriveAccountDto
    accessToken: AccessToken
  }): Promise<DeriveAccountResponseDto> {
    const token = getBearerToken(accessToken)

    const { data: account } = await this.accountHttp.derive(this.config.clientId, token, data)

    return account
  }

  async importAccount({
    data,
    accessToken,
    encryptionKey
  }: {
    data: Omit<ImportPrivateKeyDto, 'encryptedPrivateKey'> & { privateKey: string }
    accessToken: AccessToken
    encryptionKey: RsaPublicKey
  }): Promise<AccountDto> {
    const { privateKey, ...options } = data
    const encryptedPrivateKey = await rsaEncrypt(privateKey, encryptionKey)
    const token = getBearerToken(accessToken)
    const payload = { ...options, encryptedPrivateKey }

    const { data: account } = await this.accountHttp.importPrivateKey(this.config.clientId, token, payload)

    return account
  }
}
