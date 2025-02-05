import { Injectable } from '@nestjs/common'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { ProviderProxyService, ProxyRequestOptions, ProxyResponse } from '../../type/provider.type'
import { validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageProxyService implements ProviderProxyService {
  constructor(private readonly anchorageClient: AnchorageClient) {}

  async forward(
    connection: ConnectionWithCredentials,
    { data, endpoint, method }: ProxyRequestOptions
  ): Promise<ProxyResponse> {
    validateConnection(connection)

    const { url, credentials } = connection
    const { apiKey, privateKey } = credentials
    const fullUrl = `${url}${endpoint}`

    const response = await this.anchorageClient.forward({
      url: fullUrl,
      method,
      data,
      apiKey,
      signKey: privateKey
    })

    return {
      data: response.data,
      code: response.status,
      headers: response.headers
    }
  }
}
