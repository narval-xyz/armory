import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AddressService } from '../../../core/service/address.service'
import { AddressDto } from '../dto/response/address.dto'
import { PaginatedAddressesDto } from '../dto/response/addresses.dto'

@Controller({
  path: 'addresses',
  version: '1'
})
@ApiTags('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({
    summary: 'List the client addresss'
  })
  @Paginated({
    type: PaginatedAddressesDto,
    description: 'Returns a paginated list of addresss for the client'
  })
  async listByClientId(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAddressesDto> {
    const { data, page } = await this.addressService.getAddresses(clientId, options)
    const ret = PaginatedAddressesDto.create({
      addresses: data,
      page
    })
    return ret
  }

  @Get(':addressId')
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
  async getAddressById(@ClientId() clientId: string, @Param('addressId') addressId: string): Promise<AddressDto> {
    const address = await this.addressService.getAddress(clientId, addressId)
    return AddressDto.create({ address })
  }
}
