import { Action, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { AddressBookAccountDataDto } from './address-book-account-dto'

class CreateAddressBookAccountActionDto extends BaseActionDto {
  @IsEnum(Action)
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_ADDRESS_BOOK_ACCOUNT
  })
  action: typeof Action.CREATE_ADDRESS_BOOK_ACCOUNT

  @IsDefined()
  @Type(() => AddressBookAccountDataDto)
  @ValidateNested()
  @ApiProperty({
    type: AddressBookAccountDataDto
  })
  account: AddressBookAccountDataDto
}

export class CreateAddressBookAccountRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => CreateAddressBookAccountActionDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateAddressBookAccountActionDto
  })
  request: CreateAddressBookAccountActionDto
}
