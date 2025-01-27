import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Alg, RsaPrivateKey } from '@narval/signature'
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { FireblocksCredentialService } from '../../../core/provider/fireblocks/fireblocks-credential.service'
import { AccountService } from '../../../core/service/account.service'
import { ConnectionService } from '../../../core/service/connection.service'
import { WalletService } from '../../../core/service/wallet.service'
import { PendingConnection } from '../../../core/type/connection.type'
import { Provider } from '../../../core/type/provider.type'
import { formatPublicKey, formatRsaPublicKey } from '../../../core/util/user-friendly-key-format.util'
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
@ApiClientIdHeader()
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
    const publicKey = await this.formatPublicKey(pendingConnection)

    const data = {
      ...pendingConnection,
      ...(pendingConnection.encryptionPublicKey
        ? {
            encryptionPublicKey: await formatRsaPublicKey(pendingConnection.encryptionPublicKey)
          }
        : {}),
      ...(publicKey ? { publicKey } : {})
    }

    return ProviderPendingConnectionDto.create({ data })
  }

  private async formatPublicKey(connection: PendingConnection) {
    const credentials = await this.connectionService.findCredentials(connection)

    if (credentials && 'publicKey' in credentials) {
      const publicKey = await formatPublicKey(credentials.publicKey)

      if (connection.provider === Provider.FIREBLOCKS && credentials.publicKey.alg === Alg.RS256) {
        const certificateOrgName = `Narval Fireblocks Connection - Client ${connection.clientId}`

        const csr = await FireblocksCredentialService.signCertificateRequest(
          credentials.privateKey as RsaPrivateKey,
          certificateOrgName
        )

        return { ...publicKey, csr }
      }

      return publicKey
    }

    return null
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

  @Get(':connectionId/wallets')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    deprecated: true,
    summary: '(DEPRECATED) List wallets for a specific connection',
    description: 'Note: use GET /v1/provider/wallets endpoint instead'
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
    const page = await this.walletService.findAll(
      {
        clientId,
        connectionId
      },
      {
        pagination
      }
    )

    return PaginatedWalletsDto.create(page)
  }

  @Get(':connectionId/accounts')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    deprecated: true,
    summary: '(DEPRECATED) List accounts for a specific connection',
    description: 'Note: use GET /v1/provider/accounts endpoint instead'
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
    const page = await this.accountService.findAll(
      {
        clientId,
        connectionId
      },
      {
        pagination
      }
    )

    return PaginatedAccountsDto.create(page)
  }
}
