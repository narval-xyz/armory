import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../orchestration.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { AddressBookService } from '../../../core/service/address-book.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { CreateAddressBookAccountRequestDto } from '../dto/create-address-book-request.dto'
import { CreateAddressBookAccountResponseDto } from '../dto/create-address-book-response.dto'

@Controller(`${API_PREFIX}/address-book`)
@ApiTags(API_TAG)
export class AddressBookController {
  constructor(private addressBookService: AddressBookService) {}

  @Post()
  @ApiOperation({
    summary: 'Registers an account in the address book'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateAddressBookAccountResponseDto
  })
  async registerAccount(
    @OrgId() orgId: string,
    @Body() body: CreateAddressBookAccountRequestDto
  ): Promise<CreateAddressBookAccountResponseDto> {
    const { account } = body.request

    await this.addressBookService.create(orgId, account)

    return new CreateAddressBookAccountResponseDto({ account })
  }
}
