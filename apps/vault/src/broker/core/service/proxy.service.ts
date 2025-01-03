import { Injectable, NotImplementedException } from '@nestjs/common'
import { ConnectionInvalidException } from '../exception/connection-invalid.exception'
import { AnchorageProxyService } from '../provider/anchorage/anchorage-proxy.service'
import { isActiveConnection } from '../type/connection.type'
import { Provider, ProviderProxyService, ProxyResponse } from '../type/provider.type'
import { ConnectionService } from './connection.service'

type ProxyRequestOptions = {
  connectionId: string
  data?: any
  endpoint: string
  method: string
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly connectionRepository: ConnectionService,
    private readonly anchorageProxyService: AnchorageProxyService
  ) {}

  async forward(clientId: string, options: ProxyRequestOptions): Promise<ProxyResponse> {
    const { connectionId } = options
    const connection = await this.connectionRepository.findById(clientId, connectionId)

    if (!isActiveConnection(connection)) {
      throw new ConnectionInvalidException({
        message: 'Connection is not active',
        context: { connectionId, clientId, status: connection.status }
      })
    }

    const credentials = await this.connectionRepository.findCredentials(connection)

    return this.getProviderProxyService(connection.provider).forward(
      {
        ...connection,
        credentials
      },
      options
    )
  }

  private getProviderProxyService(provider: Provider): ProviderProxyService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageProxyService
      default:
        throw new NotImplementedException(`Unsupported proxy for provider ${provider}`)
    }
  }
}
