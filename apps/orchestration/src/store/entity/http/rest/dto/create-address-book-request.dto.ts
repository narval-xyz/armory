import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { AddressBookAccountDataDto } from './address-book-account.dto'

class CreateAddressBookAccountActionDto extends BaseActionDto {
  @Matches(Action.CREATE_ADDRESS_BOOK_ACCOUNT)
  @ApiProperty({
    enum: [Action.CREATE_ADDRESS_BOOK_ACCOUNT],
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

export class CreateAddressBookAccountRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateAddressBookAccountActionDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateAddressBookAccountActionDto
  })
  request: CreateAddressBookAccountActionDto
}
