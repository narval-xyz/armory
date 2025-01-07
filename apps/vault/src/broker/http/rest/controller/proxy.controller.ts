import { ApiClientIdHeader } from '@narval/nestjs-shared'
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpStatus,
  Options,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res
} from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { ProxyService } from '../../../core/service/proxy.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'

const API_PARAM = ':endpoint(*)'

const API_OPERATION = {
  summary: 'Authorizes and forwards the request to the provider',
  description:
    'This endpoint uses the connection specified in the header to authorize and forward the request in the path to the provider.'
} as const

const CONNECTION_HEADER = {
  name: REQUEST_HEADER_CONNECTION_ID,
  required: true,
  description: 'The connection ID used to forward request to provider'
} as const

const ENDPOINT_PARAM = {
  name: 'endpoint',
  required: true,
  description: 'The raw endpoint path in the provider'
} as const

const INACTIVE_CONNECTION_RESPONSE = {
  status: HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
  description: 'Requested connection is not active'
} as const

@Controller({
  path: 'proxy',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  private async handleRequest(
    clientId: string,
    connectionId: string,
    endpoint: string,
    body: unknown,
    request: Request,
    res: Response
  ) {
    const queryString = new URLSearchParams(request.query as Record<string, string>).toString()
    const sanitizedEndpoint = queryString ? `/${endpoint}?${queryString}` : `/${endpoint}`

    const response = await this.proxyService.forward(clientId, {
      connectionId,
      endpoint: sanitizedEndpoint,
      method: request.method,
      data: body
    })

    res.status(response.code).set(response.headers)
    response.data.pipe(res)
  }

  // IMPORTANT: The `@All` decorator from NestJS cannot be used here because it
  // includes a handler for the SEARCH HTTP method, which causes issues with
  // the OpenAPI generator used by the SDK.

  @Get(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async get(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Post(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async post(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Put(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async put(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Patch(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async patch(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Delete(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async delete(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Head(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async head(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }

  @Options(API_PARAM)
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader(CONNECTION_HEADER)
  @ApiOperation(API_OPERATION)
  @ApiParam(ENDPOINT_PARAM)
  @ApiResponse(INACTIVE_CONNECTION_RESPONSE)
  async options(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('endpoint') endpoint: string,
    @Body() body: unknown,
    @Req() request: Request,
    @Res() res: Response
  ) {
    return this.handleRequest(clientId, connectionId, endpoint, body, request, res)
  }
}
