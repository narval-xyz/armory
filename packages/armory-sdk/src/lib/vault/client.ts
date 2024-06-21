import { AccessToken } from '@narval/policy-engine-shared'
import { RsaPublicKey, rsaEncrypt } from '@narval/signature'
import axios from 'axios'
import { Htm } from '../domain'
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
import { getBearerToken, getJwsdProof } from '../shared/gnap'
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

    this.config = config
    this.walletHttp = WalletApiFactory(httpConfig, config.host, axiosInstance)
    this.encryptionKeyHttp = EncryptionKeyApiFactory(httpConfig, config.host, axiosInstance)
    this.accountHttp = AccountApiFactory(httpConfig, config.host, axiosInstance)
  }

  async generateEncryptionKey({ accessToken }: { accessToken: AccessToken }): Promise<RsaPublicKey> {
    const token = getBearerToken(accessToken)
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.POST,
      payload: {},
      signer: this.config.signer,
      uri: `${this.config.host}/encryption-keys`
    })

    const { data: encryptionKey } = await this.encryptionKeyHttp.generate(this.config.clientId, token, {
      headers: {
        'detached-jws': signature
      }
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

    // TODO: I can put an Axios interceptor for this.
    const token = getBearerToken(accessToken)
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.POST,
      payload: { ...payload },
      signer: this.config.signer,
      uri: `${this.config.host}/wallets`
    })

    const { data: wallet } = await this.walletHttp.generate(this.config.clientId, token, payload, {
      headers: {
        'detached-jws': signature
      }
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
    const token = getBearerToken(accessToken)
    const { seed, ...options } = data
    const encryptedSeed = await rsaEncrypt(seed, encryptionKey)
    const payload = { ...options, encryptedSeed }
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.POST,
      payload: payload,
      signer: this.config.signer,
      uri: `${this.config.host}/wallets/import`
    })

    const { data: wallet } = await this.walletHttp.importSeed(this.config.clientId, token, payload, {
      headers: {
        'detached-jws': signature
      }
    })

    return wallet
  }

  async listWallets({ accessToken }: { accessToken: AccessToken }): Promise<WalletsDto> {
    const token = getBearerToken(accessToken)
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.GET,
      payload: {},
      signer: this.config.signer,
      uri: `${this.config.host}/wallets`
    })

    const { data: wallets } = await this.walletHttp.list(this.config.clientId, token, {
      headers: {
        'detached-jws': signature
      }
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
    const token = getBearerToken(accessToken)
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.POST,
      payload: { ...data },
      signer: this.config.signer,
      uri: `${this.config.host}/accounts`
    })

    const { data: account } = await this.accountHttp.derive(this.config.clientId, token, data, {
      headers: {
        'detached-jws': signature
      }
    })

    return account
  }

  async importPrivateKey({
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
    const signature = await getJwsdProof({
      accessToken,
      htm: Htm.POST,
      payload: payload,
      signer: this.config.signer,
      uri: `${this.config.host}/accounts/import`
    })

    const { data: account } = await this.accountHttp.importPrivateKey(this.config.clientId, token, payload, {
      headers: {
        'detached-jws': signature
      }
    })

    return account
  }
}
