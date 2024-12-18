import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { publicKeyToHex, publicKeyToPem } from '@narval/signature'
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AccountService } from '../../../core/service/account.service'
import { ConnectionService } from '../../../core/service/connection.service'
import { WalletService } from '../../../core/service/wallet.service'
import { CreateConnectionDto } from '../dto/request/create-connection.dto'
import { InitiateConnectionDto } from '../dto/request/initiate-connection.dto'
import { UpdateConnectionDto } from '../dto/request/update-connection.dto'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedConnectionsDto } from '../dto/response/paginated-connections.dto'
import { PaginatedWalletsDto } from '../dto/response/paginated-wallets.dto'
import { ProviderConnectionDto } from '../dto/response/provider-connection.dto'
import { ProviderPendingConnectionDto } from '../dto/response/provider-pending-connection.dto'

@Controller({
  path: 'connections',
  version: '1'
})
@ApiTags('Provider Connection')
export class ConnectionController {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService
  ) {}

  @Post('/initiate')
  @PermissionGuard(VaultPermission.CONNECTION_WRITE)
  @ApiOperation({
    summary: 'Initiate a new provider connection',
    description:
      'This endpoint initiates a new connection by generating a public key and an encryption key for secure communication.'
  })
  @ApiResponse({
    description: 'Returns the public key and encryption key for the initiated connection.',
    status: HttpStatus.CREATED,
    type: ProviderPendingConnectionDto
  })
  async initiate(
    @ClientId() clientId: string,
    @Body() body: InitiateConnectionDto
  ): Promise<ProviderPendingConnectionDto> {
    const pendingConnection = await this.connectionService.initiate(clientId, body)

    const encryptionPem = pendingConnection.encryptionPublicKey
      ? await publicKeyToPem(pendingConnection.encryptionPublicKey, pendingConnection.encryptionPublicKey.alg)
      : undefined

    const data = {
      ...pendingConnection,
      encryptionPublicKey: {
        keyId: pendingConnection.encryptionPublicKey?.kid,
        jwk: pendingConnection.encryptionPublicKey,
        pem: encryptionPem ? Buffer.from(encryptionPem).toString('base64') : undefined
      },
      ...(pendingConnection.credentials
        ? {
            publicKey: {
              keyId: pendingConnection.credentials.publicKey.kid,
              jwk: pendingConnection.credentials.publicKey,
              hex: await publicKeyToHex(pendingConnection.credentials.publicKey)
            }
          }
        : {})
    }

    return ProviderPendingConnectionDto.create({ data })
  }

  @Post()
  @PermissionGuard(VaultPermission.CONNECTION_WRITE)
  @ApiOperation({
    summary: 'Store a provider connection securely',
    description:
      'This endpoint securely stores the details of a provider connection, ensuring that all sensitive information is encrypted.'
  })
  @ApiResponse({
    description: 'Returns a reference to the stored provider connection.',
    status: HttpStatus.CREATED,
    type: ProviderConnectionDto
  })
  async create(@ClientId() clientId: string, @Body() body: CreateConnectionDto): Promise<ProviderConnectionDto> {
    const data = await this.connectionService.create(clientId, body)

    return ProviderConnectionDto.create({ data })
  }

  @Delete(':connectionId')
  @PermissionGuard(VaultPermission.CONNECTION_WRITE)
  @ApiOperation({
    summary: 'Revoke an existing connection',
    description:
      'This endpoint revokes an existing connection, effectively terminating any ongoing communication and invalidating the connection credentials.'
  })
  @ApiResponse({
    description: 'Indicates that the connection has been successfully revoked. No content is returned in the response.',
    status: HttpStatus.NO_CONTENT
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@ClientId() clientId: string, @Param('connectionId') connectionId: string): Promise<void> {
    await this.connectionService.revoke(clientId, connectionId)
  }

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List all connections',
    description: 'This endpoint retrieves a list of all connections associated with the client.'
  })
  @Paginated({
    type: PaginatedConnectionsDto,
    description: 'Returns a paginated list of connections associated with the client'
  })
  async list(
    @ClientId() clientId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedConnectionsDto> {
    const { data, page } = await this.connectionService.findAll(clientId, { pagination })

    return PaginatedConnectionsDto.create({ data, page })
  }

  @Get(':connectionId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve a specific connection by ID',
    description:
      'This endpoint retrieves the details of a specific connection associated with the client, identified by the ID.'
  })
  @ApiResponse({
    description: 'Returns the details of the specified connection.',
    type: ProviderConnectionDto,
    status: HttpStatus.OK
  })
  async getById(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string
  ): Promise<ProviderConnectionDto> {
    const data = await this.connectionService.findById(clientId, connectionId)

    return ProviderConnectionDto.create({ data })
  }

  @Patch(':connectionId')
  @PermissionGuard(VaultPermission.CONNECTION_WRITE)
  @ApiOperation({
    summary: 'Update a specific connection by ID',
    description:
      'This endpoint updates the details of a specific connection associated with the client, identified by the connection ID.'
  })
  @ApiResponse({
    description: 'Returns the updated details of the provider connection.',
    status: HttpStatus.OK,
    type: ProviderConnectionDto
  })
  async update(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: UpdateConnectionDto
  ): Promise<ProviderConnectionDto> {
    const data = await this.connectionService.update({
      ...body,
      clientId,
      connectionId
    })

    return ProviderConnectionDto.create({ data })
  }

  @Get(':connectionId/wallets')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List wallets for a specific connection',
    description: 'This endpoint retrieves a list of wallets associated with a specific connection.'
  })
  @Paginated({
    type: PaginatedWalletsDto,
    description: 'Returns a paginated list of wallets associated with the connection'
  })
  async listWallets(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedWalletsDto> {
    const { data, page } = await this.walletService.findAll(clientId, {
      filters: { connectionId },
      pagination
    })

    return PaginatedWalletsDto.create({ data, page })
  }

  @Get(':connectionId/accounts')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List accounts for a specific connection',
    description: 'This endpoint retrieves a list of accounts associated with a specific connection.'
  })
  @Paginated({
    type: PaginatedAccountsDto,
    description: 'Returns a paginated list of accounts associated with the connection'
  })
  async listAccounts(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    const { data, page } = await this.accountService.findAll(clientId, {
      filters: { connectionId },
      pagination
    })

    return PaginatedAccountsDto.create({ data, page })
  }
}
