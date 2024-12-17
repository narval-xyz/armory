import { HttpStatus, Injectable } from '@nestjs/common'
import { AnchorageClient } from '../../http/client/anchorage.client'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { ConnectionInvalidException } from '../exception/connection-invalid.exception'
import { HttpMethod } from '../lib/anchorage-request-builder'
import { ConnectionStatus } from '../type/connection.type'

type RawRequestOptions = {
  connectionId: string
  body?: any
  endpoint: string
  method: HttpMethod
}
@Injectable()
export class ProxyService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  async rawRequest(
    clientId: string,
    { connectionId, body, endpoint, method }: RawRequestOptions
  ): Promise<{ data: any; code: HttpStatus; headers: Record<string, any> }> {
    const connection = await this.connectionRepository.findById(clientId, connectionId, true)
    if (connection.status !== ConnectionStatus.ACTIVE) {
      throw new ConnectionInvalidException({
        message: 'Connection is not active',
        context: { connectionId, clientId, status: connection.status }
      })
    }

    const { url, credentials } = connection
    const { apiKey, privateKey } = credentials

    const fullUrl = `${url}${endpoint}`

    const response = await this.anchorageClient.forward({
      url: fullUrl,
      method,
      body,
      apiKey,
      signKey: privateKey
    })

    const { status: code, headers, data } = response
    return { data, code, headers }
  }
}
