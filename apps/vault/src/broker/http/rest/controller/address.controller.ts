import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AddressService } from '../../../core/service/address.service'
import { ProviderAddressDto } from '../dto/response/address.dto'
import { PaginatedAddressesDto } from '../dto/response/paginated-addresses.dto'

@Controller({
  path: 'addresses',
  version: '1'
})
@ApiTags('Provider Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List the client addresss'
  })
  @Paginated({
    type: PaginatedAddressesDto,
    description: 'Returns a paginated list of addresss for the client'
  })
  async list(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAddressesDto> {
    const { data, page } = await this.addressService.getAddresses(clientId, options)

    return PaginatedAddressesDto.create({
      addresses: data,
      page
    })
  }

  @Get(':addressId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Get a specific address by ID'
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
  async getAddressById(
    @ClientId() clientId: string,
    @Param('addressId') addressId: string
  ): Promise<ProviderAddressDto> {
    const address = await this.addressService.getAddress(clientId, addressId)

    return ProviderAddressDto.create({ address })
  }
}
