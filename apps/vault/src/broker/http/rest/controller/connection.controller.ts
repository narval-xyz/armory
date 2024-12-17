import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
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
import { ConnectionListDto } from '../dto/response/connection-list.dto'
import { ConnectionDto } from '../dto/response/connection.dto'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedConnectionsDto } from '../dto/response/paginated-connections.dto'
import { PaginatedWalletsDto } from '../dto/response/paginated-wallets.dto'
import { PendingConnectionDto } from '../dto/response/pending-connection.dto'

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
    type: PendingConnectionDto
  })
  async initiate(@ClientId() clientId: string, @Body() body: InitiateConnectionDto): Promise<PendingConnectionDto> {
    const pendingConnection = await this.connectionService.initiate(clientId, body)

    return PendingConnectionDto.create(pendingConnection)
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
    type: ConnectionDto
  })
  async create(@ClientId() clientId: string, @Body() body: CreateConnectionDto): Promise<ConnectionDto> {
    const connection = await this.connectionService.create(clientId, body)

    return ConnectionDto.create(connection)
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
  @ApiResponse({
    description: 'Returns a list of connections associated with the client.',
    type: ConnectionListDto,
    status: HttpStatus.OK
  })
  @Paginated({
    type: PaginatedConnectionsDto,
    description: 'Returns a paginated list of wallets associated with the connection'
  })
  async list(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedConnectionsDto> {
    const { data, page } = await this.connectionService.findAllPaginated(clientId, options)

    return PaginatedConnectionsDto.create({ connections: data, page })
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
    type: ConnectionDto,
    status: HttpStatus.OK
  })
  async getById(@ClientId() clientId: string, @Param('connectionId') connectionId: string): Promise<ConnectionDto> {
    const connection = await this.connectionService.findById(clientId, connectionId)

    return ConnectionDto.create(connection)
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
    type: ConnectionDto
  })
  async update(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: UpdateConnectionDto
  ): Promise<ConnectionDto> {
    const connection = await this.connectionService.update({
      ...body,
      clientId,
      connectionId
    })

    return ConnectionDto.create(connection)
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
  async getWallets(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedWalletsDto> {
    const { data, page } = await this.walletService.findAllPaginated(clientId, {
      ...options,
      filters: { connectionId }
    })

    return PaginatedWalletsDto.create({ wallets: data, page })
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
  async getAccounts(
    @ClientId() clientId: string,
    @Param('connectionId') connectionId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    // TODO: Move the method from the connection service to accounts.
    const { data, page } = await this.accountService.findAllPaginated(clientId, {
      ...options,
      filters: { connectionId }
    })

    return PaginatedAccountsDto.create({ accounts: data, page })
  }
}
