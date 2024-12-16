import { All, Body, Controller, HttpStatus, Param, Req, Res } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ConnectionId } from '../../../../shared/decorator/connection-id.decorator'
import { ProxyRequestException } from '../../../core/exception/proxy-request.exception'
import { HttpMethod } from '../../../core/lib/anchorage-request-builder'
import { ProxyService } from '../../../core/service/proxy.service'

@Controller({
  path: 'proxy',
  version: '1'
})
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(':endpoint(*)')
  @ApiHeader({
    name: 'x-connection-id',
    required: true,
    description: 'The connection ID used to forward request to provider'
  })
  @ApiOperation({
    summary: 'Forward request to provider',
    description:
      'This endpoint uses the connection specified in the header to sign and forward the request in the path to the provider.'
  })
  @ApiParam({
    name: 'endpoint',
    required: true,
    description: 'The raw endpoint path in the provider'
  })
  @ApiResponse({
    status: HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
    description: 'Requested connection is not active'
  })
  async proxyRequest(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    const queryString = new URLSearchParams(request.query as Record<string, string>).toString()
    const sanitizedEndpoint = queryString ? `/${endpoint}?${queryString}` : `/${endpoint}`

    try {
      const response = await this.proxyService.rawRequest(clientId, {
        connectionId,
        endpoint: sanitizedEndpoint,
        method: HttpMethod.parse(request.method),
        body
      })

      res.status(response.code).set(response.headers).send(response.data)
    } catch (error) {
      if (error instanceof ProxyRequestException) {
        res.status(error.code).set(error.headers).send(error.data)
      } else {
        throw error
      }
    }
  }
}
