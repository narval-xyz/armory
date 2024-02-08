import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { AddressBookAccount } from '../../../../shared/types/entities.types'
import { AddressBookAccountDataDto } from './address-book-account-dto'

export class CreateAddressBookAccountResponseDto {
  constructor(account: AddressBookAccount) {
    this.account = new AddressBookAccountDataDto(account)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  account: AddressBookAccountDataDto
}
