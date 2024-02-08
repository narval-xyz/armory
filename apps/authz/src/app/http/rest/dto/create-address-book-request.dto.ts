import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'
import { AddressBookAccountDataDto } from './address-book-account-dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

class CreateAddressBookAccountActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_ADDRESS_BOOK_ACCOUNT
  })
  action: typeof Action.CREATE_ADDRESS_BOOK_ACCOUNT

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  account: AddressBookAccountDataDto
}

export class CreateAddressBookAccountRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: CreateAddressBookAccountActionDto
}
