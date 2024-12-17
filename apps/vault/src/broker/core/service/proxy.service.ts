/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpStatus, Injectable } from '@nestjs/common'
import { AnchorageClient } from '../../http/client/anchorage.client'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { ConnectionInvalidException } from '../exception/connection-invalid.exception'
import { isActiveConnection } from '../type/connection.type'

type ProxyRequestOptions = {
  connectionId: string
  data?: any
  endpoint: string
  method: string
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  async forward(
    clientId: string,
    { connectionId, data, endpoint, method }: ProxyRequestOptions
  ): Promise<{ data: any; code: HttpStatus; headers: Record<string, any> }> {
    const connection = await this.connectionRepository.findById(clientId, connectionId, true)

    if (!isActiveConnection(connection)) {
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
