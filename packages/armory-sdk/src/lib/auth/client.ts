import assert from 'assert'
import axios from 'axios'
import { ClientApiFactory, Configuration, CreateClientRequestDto, CreateClientResponseDto } from '../http/client/auth'
import { AuthAdminConfig, ClientHttp } from './type'

export class AuthAdminClient {
  private config: AuthAdminConfig

  private clientHttp: ClientHttp

  constructor(config: AuthAdminConfig) {
    const httpConfig = new Configuration({
      basePath: config.host
    })

    const axiosInstance = axios.create()

    this.config = config
    this.clientHttp = ClientApiFactory(httpConfig, config.host, axiosInstance)
  }

  async createClient(input: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    assert(this.config.adminApiKey !== undefined, 'Missing admin API key')

    const { data } = await this.clientHttp.create(this.config.adminApiKey, input)

    return data
  }
}
