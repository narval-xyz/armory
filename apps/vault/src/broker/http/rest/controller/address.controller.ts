import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AddressService } from '../../../core/service/address.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { PaginatedAddressesDto } from '../dto/response/paginated-addresses.dto'
import { ProviderAddressDto } from '../dto/response/provider-address.dto'

@Controller({
  path: 'addresses',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Address')
export class ProviderAddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @ApiOperation({
    summary: 'List the client addresss'
  })
  @Paginated({
    type: PaginatedAddressesDto,
    description: 'Returns a paginated list of addresss for the client'
  })
  async list(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedAddressesDto> {
    return PaginatedAddressesDto.create(
      await this.addressService.findAll(
        {
          clientId,
          connectionId
        },
        {
          pagination
        }
      )
    )
  }

  @Get(':addressId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Get a specific address by ID'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @ApiParam({
    name: 'addressId',
    description: 'The ID of the address to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedAddressesDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Address not found'
  })
  async getById(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('addressId') addressId: string
  ): Promise<ProviderAddressDto> {
    const data = await this.addressService.findById({ clientId, connectionId }, addressId)

    return ProviderAddressDto.create({ data })
  }
}
