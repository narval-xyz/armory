import { AccessToken, Request, SerializedSignableRequest } from '@narval/policy-engine-shared'
import { RsaPublicKey, rsaEncrypt } from '@narval/signature'
import axios, { AxiosResponse } from 'axios'
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
  InitiateConnectionDto,
  PaginatedAccountsDto,
  PaginatedAddressesDto,
  PaginatedAssetsDto,
  PaginatedConnectionsDto,
  PaginatedKnownDestinationsDto,
  PaginatedNetworksDto,
  PaginatedRawAccountsDto,
  PaginatedScopedSyncsDto,
  PaginatedSyncsDto,
  PaginatedWalletsDto,
  PongDto,
  ProviderAccountApiFactory,
  ProviderAccountDto,
  ProviderAddressApiFactory,
  ProviderAssetApiFactory,
  ProviderConnectionApiFactory,
  ProviderConnectionDto,
  ProviderKnownDestinationApiFactory,
  ProviderNetworkApiFactory,
  ProviderPendingConnectionDto,
  ProviderProxyApiDeleteRequest,
  ProviderProxyApiFactory,
  ProviderProxyApiGetRequest,
  ProviderProxyApiHeadRequest,
  ProviderProxyApiOptionsRequest,
  ProviderProxyApiPatchRequest,
  ProviderProxyApiPostRequest,
  ProviderProxyApiPutRequest,
  ProviderScopedSyncApiFactory,
  ProviderSyncApiFactory,
  ProviderTransferApiFactory,
  ProviderWalletApiFactory,
  ProviderWalletDto,
  ScopedSyncDto,
  SendTransferDto,
  SignApiFactory,
  SignatureDto,
  StartScopedSyncDto,
  TransferDto,
  UpdateConnectionDto,
  WalletApiFactory,
  WalletDto,
  WalletsDto
} from '../http/client/vault'
import { interceptRequestAddDetachedJwsHeader, prefixGnapToken } from '../shared/gnap'
import { VaultAdminConfig, VaultConfig } from './type'

interface RequestPagination {
  cursor?: string
  limit?: number
  desc?: 'true' | 'false'
}

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

  private providerNetworkHttp

  private providerAssetHttp

  private providerConnectionHttp

  private providerSyncHttp

  private providerScopedSyncHttp

  private providerWalletHttp

  private providerAccountHttp

  private providerAddressHttp

  private providerKnownDestinationHttp

  private providerTransferHttp

  private providerProxyHttp

  private applicationApi

  constructor(config: VaultConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    axiosInstance.interceptors.request.use(interceptRequestAddDetachedJwsHeader(config.signer))

    this.config = config

    // Local keygen & signing clients
    this.walletHttp = WalletApiFactory(httpConfig, config.host, axiosInstance)
    this.encryptionKeyHttp = EncryptionKeyApiFactory(httpConfig, config.host, axiosInstance)
    this.accountHttp = AccountApiFactory(httpConfig, config.host, axiosInstance)
    this.signHttp = SignApiFactory(httpConfig, config.host, axiosInstance)

    // Provider API clients
    this.providerConnectionHttp = ProviderConnectionApiFactory(httpConfig, config.host, axiosInstance)
    this.providerSyncHttp = ProviderSyncApiFactory(httpConfig, config.host, axiosInstance)
    this.providerScopedSyncHttp = ProviderScopedSyncApiFactory(httpConfig, config.host, axiosInstance)
    this.providerWalletHttp = ProviderWalletApiFactory(httpConfig, config.host, axiosInstance)
    this.providerAccountHttp = ProviderAccountApiFactory(httpConfig, config.host, axiosInstance)
    this.providerAddressHttp = ProviderAddressApiFactory(httpConfig, config.host, axiosInstance)
    this.providerKnownDestinationHttp = ProviderKnownDestinationApiFactory(httpConfig, config.host, axiosInstance)
    this.providerTransferHttp = ProviderTransferApiFactory(httpConfig, config.host, axiosInstance)
    this.providerProxyHttp = ProviderProxyApiFactory(httpConfig, config.host, axiosInstance)
    this.providerNetworkHttp = ProviderNetworkApiFactory(httpConfig, config.host, axiosInstance)
    this.providerAssetHttp = ProviderAssetApiFactory(httpConfig, config.host, axiosInstance)
    this.applicationApi = new ApplicationApi(httpConfig, config.host, axiosInstance)
  }

  async ping(): Promise<PongDto> {
    const { data } = await this.applicationApi.ping()

    return data
  }

  async generateEncryptionKey({ accessToken }: { accessToken?: AccessToken } = {}): Promise<RsaPublicKey> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

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

  async listNetworks({
    accessToken,
    pagination
  }: {
    accessToken?: AccessToken
    pagination?: RequestPagination
  } = {}): Promise<PaginatedNetworksDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data } = await this.providerNetworkHttp.list({
      xClientId: this.config.clientId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return data
  }

  async listAssets({
    accessToken,
    pagination
  }: {
    accessToken?: AccessToken
    pagination?: RequestPagination
  } = {}): Promise<PaginatedAssetsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data } = await this.providerAssetHttp.list({
      xClientId: this.config.clientId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return data
  }

  /**
   * Provider Connection
   */

  async createConnection({
    data,
    accessToken
  }: {
    data: CreateConnectionDto
    accessToken?: AccessToken
  }): Promise<ProviderConnectionDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connection } = await this.providerConnectionHttp.create({
      xClientId: this.config.clientId,
      authorization: token,
      createConnectionDto: data
    })

    return connection
  }

  async initiateConnection({
    data,
    accessToken
  }: {
    data: InitiateConnectionDto
    accessToken?: AccessToken
  }): Promise<ProviderPendingConnectionDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connection } = await this.providerConnectionHttp.initiate({
      xClientId: this.config.clientId,
      authorization: token,
      initiateConnectionDto: data
    })

    return connection
  }

  async listConnections({
    accessToken,
    pagination
  }: {
    accessToken?: AccessToken
    pagination?: RequestPagination
  } = {}): Promise<PaginatedConnectionsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connections } = await this.providerConnectionHttp.list({
      xClientId: this.config.clientId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return connections
  }

  async getConnection({
    connectionId,
    accessToken
  }: {
    connectionId: string
    accessToken?: AccessToken
  }): Promise<ProviderConnectionDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connection } = await this.providerConnectionHttp.getById({
      xClientId: this.config.clientId,
      connectionId,
      authorization: token
    })

    return connection
  }

  async revokeConnection({
    connectionId,
    accessToken
  }: {
    connectionId: string
    accessToken?: AccessToken
  }): Promise<void> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    await this.providerConnectionHttp.revoke({ xClientId: this.config.clientId, connectionId, authorization: token })
  }

  async updateConnection({
    connectionId,
    data,
    accessToken
  }: {
    connectionId: string
    data: UpdateConnectionDto
    accessToken?: AccessToken
  }): Promise<ProviderConnectionDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: connection } = await this.providerConnectionHttp.update({
      xClientId: this.config.clientId,
      connectionId,
      authorization: token,
      updateConnectionDto: data
    })

    return connection
  }

  async listProviderAccounts({
    connectionId,
    walletId,
    accessToken,
    pagination
  }: {
    connectionId: string
    walletId?: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedAccountsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined
    if (walletId) {
      const { data: accounts } = await this.providerWalletHttp.listAccounts({
        xClientId: this.config.clientId,
        walletId,
        authorization: token,
        cursor: pagination?.cursor,
        limit: pagination?.limit,
        desc: pagination?.desc
      })

      return accounts
    }

    const { data: accounts } = await this.providerAccountHttp.list({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return accounts
  }

  async listProviderRawAccounts({
    accessToken,
    assetId,
    connectionId,
    includeAddress,
    namePrefix,
    nameSuffix,
    networkId,
    pagination
  }: {
    accessToken?: AccessToken
    assetId?: string
    connectionId: string
    includeAddress?: boolean
    namePrefix?: string
    nameSuffix?: string
    networkId?: string
    pagination?: RequestPagination
    walletId?: string
  }): Promise<PaginatedRawAccountsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data } = await this.providerAccountHttp.listRaw({
      assetId,
      includeAddress,
      namePrefix,
      nameSuffix,
      networkId,
      authorization: token,
      cursor: pagination?.cursor,
      desc: pagination?.desc,
      limit: pagination?.limit,
      xClientId: this.config.clientId,
      xConnectionId: connectionId
    })

    return data
  }

  /**
   * @deprecated Use listScopedSyncs() instead.
   */
  async listSyncs({
    connectionId,
    accessToken,
    pagination
  }: {
    connectionId: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedSyncsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: syncs } = await this.providerSyncHttp.list({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return syncs
  }

  /**
   * Provider Wallet
   */

  async getProviderWallet({
    walletId,
    accessToken
  }: {
    walletId: string
    accessToken?: AccessToken
  }): Promise<ProviderWalletDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: wallet } = await this.providerWalletHttp.getById({
      xClientId: this.config.clientId,
      walletId,
      authorization: token
    })

    return wallet
  }

  async listProviderWallets({
    connectionId,
    accessToken,
    pagination
  }: {
    connectionId: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedWalletsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: wallets } = await this.providerWalletHttp.list({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return wallets
  }

  /**
   * Provider Account
   */

  async getProviderAccount({
    accountId,
    accessToken
  }: {
    accountId: string
    accessToken?: AccessToken
  }): Promise<ProviderAccountDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: account } = await this.providerAccountHttp.getById({
      xClientId: this.config.clientId,
      accountId,
      authorization: token
    })

    return account
  }

  async listProviderAddresses({
    accountId,
    accessToken,
    pagination
  }: {
    accountId?: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedAddressesDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    if (!accountId) {
      const { data: addresses } = await this.providerAddressHttp.list({
        xClientId: this.config.clientId,
        authorization: token,
        cursor: pagination?.cursor,
        limit: pagination?.limit,
        desc: pagination?.desc
      })
      return addresses
    }

    const { data: addresses } = await this.providerAccountHttp.listAddresses({
      xClientId: this.config.clientId,
      accountId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return addresses
  }

  /**
   * Provider Address
   */

  async getProviderAddress({
    addressId,
    accessToken
  }: {
    addressId: string
    accessToken?: AccessToken
  }): Promise<PaginatedAddressesDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: address } = await this.providerAddressHttp.getById({
      xClientId: this.config.clientId,
      addressId,
      authorization: token
    })

    return address
  }

  /**
   * Provider Known Destination
   */

  async listProviderKnownDestinations({
    connectionId,
    accessToken,
    pagination
  }: {
    connectionId: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedKnownDestinationsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: knownDestinations } = await this.providerKnownDestinationHttp.list({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return knownDestinations
  }

  /**
   * Provider Transfer
   */

  async sendTransfer({
    data,
    connectionId,
    accessToken
  }: {
    data: SendTransferDto
    connectionId: string
    accessToken?: AccessToken
  }): Promise<TransferDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: transfer } = await this.providerTransferHttp.send({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      sendTransferDto: data
    })

    return transfer
  }

  async getTransfer({
    transferId,
    connectionId,
    accessToken
  }: {
    transferId: string
    connectionId: string
    accessToken?: AccessToken
  }): Promise<TransferDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: transfer } = await this.providerTransferHttp.getById({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      transferId,
      authorization: token
    })

    return transfer
  }

  /**
   * Provider Proxy
   */

  async proxyDelete({
    data,
    accessToken
  }: {
    data: ProviderProxyApiDeleteRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp._delete({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyOptions({
    data,
    accessToken
  }: {
    data: ProviderProxyApiOptionsRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp._options({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyGet({
    data,
    accessToken
  }: {
    data: ProviderProxyApiGetRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp.get({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyPost({
    data,
    accessToken
  }: {
    data: ProviderProxyApiPostRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp.post({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyPut({
    data,
    accessToken
  }: {
    data: ProviderProxyApiPutRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp.put({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyPatch({
    data,
    accessToken
  }: {
    data: ProviderProxyApiPatchRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp.patch({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async proxyHead({
    data,
    accessToken
  }: {
    data: ProviderProxyApiHeadRequest
    accessToken?: AccessToken
  }): Promise<AxiosResponse> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const ret = await this.providerProxyHttp.head({
      xClientId: this.config.clientId,
      authorization: token,
      endpoint: data.endpoint,
      xConnectionId: data.xConnectionId
    })
    return ret
  }

  async scopedSync({ data, accessToken }: { data: StartScopedSyncDto; accessToken?: AccessToken }) {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: sync } = await this.providerScopedSyncHttp.start({
      xClientId: this.config.clientId,
      authorization: token,
      startScopedSyncDto: data
    })

    return sync
  }

  async getScopedSync({
    scopedSyncId,
    accessToken,
    connectionId
  }: {
    scopedSyncId: string
    connectionId: string
    accessToken?: AccessToken
  }): Promise<ScopedSyncDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: sync } = await this.providerScopedSyncHttp.getById({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      scopedSyncId,
      authorization: token
    })

    return sync
  }

  async listScopedSyncs({
    connectionId,
    accessToken,
    pagination
  }: {
    connectionId: string
    accessToken?: AccessToken
    pagination?: RequestPagination
  }): Promise<PaginatedScopedSyncsDto> {
    const token = accessToken ? prefixGnapToken(accessToken) : undefined

    const { data: scopedSyncs } = await this.providerScopedSyncHttp.list({
      xClientId: this.config.clientId,
      xConnectionId: connectionId,
      authorization: token,
      cursor: pagination?.cursor,
      limit: pagination?.limit,
      desc: pagination?.desc
    })

    return scopedSyncs
  }
}
