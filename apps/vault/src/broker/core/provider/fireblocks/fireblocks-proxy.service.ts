import { Injectable } from '@nestjs/common'
import { v4 } from 'uuid'
import { FireblocksClient } from '../../../http/client/fireblocks.client'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { ProviderProxyService, ProxyRequestOptions, ProxyResponse } from '../../type/provider.type'
import { validateConnection } from './fireblocks.util'

@Injectable()
export class FireblocksProxyService implements ProviderProxyService {
  constructor(private readonly fireblocksClient: FireblocksClient) {}

  async forward(
    connection: ConnectionWithCredentials,
    { data, endpoint, method, nonce }: ProxyRequestOptions
  ): Promise<ProxyResponse> {
    validateConnection(connection)

    const { url, credentials } = connection
    const { apiKey, privateKey } = credentials
    const fullUrl = `${url}${endpoint}`

    const response = await this.fireblocksClient.forward({
      url: fullUrl,
      method,
      data,
      apiKey,
      nonce: nonce || v4(),
      signKey: privateKey
    })

    return {
      data: response.data,
      code: response.status,
      headers: response.headers
    }
  }
}
