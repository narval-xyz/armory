import { AddressBookAccountDataDto } from '@app/authz/app/http/rest/dto/address-book-account-dto'
import { AddressBookAccount } from '@app/authz/shared/types/entities.types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class CreateAddressBookAccountResponseDto {
  constructor(account: AddressBookAccount) {
    this.account = new AddressBookAccountDataDto(account)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  account: AddressBookAccountDataDto
}
