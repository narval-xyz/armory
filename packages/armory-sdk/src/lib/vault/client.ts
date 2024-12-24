import { AccessToken, Request, SerializedSignableRequest } from '@narval/policy-engine-shared'
import { RsaPublicKey, rsaEncrypt } from '@narval/signature'
import axios from 'axios'
import {
  AccountApiFactory,
  AccountDto,
  AccountsDto,
  ApplicationApi,
  ClientApiFactory,
  ClientDto,
  Configuration,
  CreateClientDto,
  CreateConnectionDto,
  DeriveAccountDto,
  DeriveAccountResponseDto,
  EncryptionKeyApiFactory,
  GenerateWalletDto,
  ImportPrivateKeyDto,
  ImportWalletDto,
  PongDto,
  ProviderConnectionApiFactory,
  ProviderConnectionDto,
  SignApiFactory,
  SignatureDto,
  WalletApiFactory,
  WalletDto,
  WalletsDto
} from '../http/client/vault'
import { interceptRequestAddDetachedJwsHeader, prefixGnapToken } from '../shared/gnap'
import { VaultAdminConfig, VaultConfig } from './type'

export class VaultAdminClient {
  private config: VaultAdminConfig

  private clientHttp

  constructor(config: VaultAdminConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = config
    this.clientHttp = ClientApiFactory(httpConfig, config.host, axiosInstance)
  }

  async createClient(input: CreateClientDto): Promise<ClientDto> {
    const { data } = await this.clientHttp.create({
      xApiKey: this.config.adminApiKey,
      createClientDto: input
    })

    return data
  }
}

export class VaultClient {
  private config: VaultConfig

  private encryptionKeyHttp

  private walletHttp

  private accountHttp

  private signHttp

  private connectionHttp

  private applicationApi

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
    this.signHttp = SignApiFactory(httpConfig, config.host, axiosInstance)
    this.connectionHttp = ProviderConnectionApiFactory(httpConfig, config.host, axiosInstance)
    this.applicationApi = new ApplicationApi(httpConfig, config.host, axiosInstance)
  }

  async ping(): Promise<PongDto> {
    const { data } = await this.applicationApi.ping()

    return data
  }

  async generateEncryptionKey({ accessToken }: { accessToken: AccessToken }): Promise<RsaPublicKey> {
    const token = prefixGnapToken(accessToken)

    const { data: encryptionKey } = await this.encryptionKeyHttp.generate({
      xClientId: this.config.clientId,
      authorization: token
    })

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
    const token = prefixGnapToken(accessToken)

    const { data: wallet } = await this.walletHttp.generate({
      xClientId: this.config.clientId,
      authorization: token,
      generateWalletDto: payload
    })

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
    const token = prefixGnapToken(accessToken)
    const { seed, ...options } = data
    const encryptedSeed = await rsaEncrypt(seed, encryptionKey)
    const payload = { ...options, encryptedSeed }

    const { data: wallet } = await this.walletHttp.importSeed({
      xClientId: this.config.clientId,
      authorization: token,
      importWalletDto: payload
    })

    return wallet
  }

  async listWallets({ accessToken }: { accessToken: AccessToken }): Promise<WalletsDto> {
    const token = prefixGnapToken(accessToken)

    const { data: wallets } = await this.walletHttp.list({
      xClientId: this.config.clientId,
      authorization: token
    })

    return wallets
  }

  async deriveAccounts({
    data,
    accessToken
  }: {
    data: DeriveAccountDto
    accessToken: AccessToken
  }): Promise<DeriveAccountResponseDto> {
    const token = prefixGnapToken(accessToken)

    const { data: account } = await this.accountHttp.derive({
      xClientId: this.config.clientId,
      authorization: token,
      deriveAccountDto: data
    })

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
    const token = prefixGnapToken(accessToken)
    const payload = { ...options, encryptedPrivateKey }

    const { data: account } = await this.accountHttp.importPrivateKey({
      xClientId: this.config.clientId,
      authorization: token,
      importPrivateKeyDto: payload
    })

    return account
  }

  async listAccounts({ accessToken }: { accessToken: AccessToken }): Promise<AccountsDto> {
    const token = prefixGnapToken(accessToken)

    const { data: accounts } = await this.accountHttp.list({
      xClientId: this.config.clientId,
      authorization: token
    })

    return accounts
  }

  async sign({ data, accessToken }: { data: Request; accessToken: AccessToken }): Promise<SignatureDto> {
    const token = prefixGnapToken(accessToken)
    const parsedRequest = Request.parse(data)

    const { data: signature } = await this.signHttp.sign({
      xClientId: this.config.clientId,
      authorization: token,
      signRequestDto: {
        request: SerializedSignableRequest.parse(parsedRequest)
      }
    })

    return signature
  }

  async createConnection({
    data,
    accessToken
  }: {
    data: CreateConnectionDto
    accessToken?: AccessToken
  }): Promise<ProviderConnectionDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connection } = await this.connectionHttp.create({
      xClientId: this.config.clientId,
      authorization: token,
      createConnectionDto: data
    })

    return connection
  }
}
