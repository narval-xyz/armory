import axios from 'axios'
import { ClientApiFactory, ClientDto, Configuration, CreateClientDto } from '../http/client/vault'
import { ClientHttp, VaultAdminConfig } from './type'

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
