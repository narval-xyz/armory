import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { AddressBookAccountDto } from './address-book-account.dto'

export class CreateAddressBookAccountResponseDto {
  @IsDefined()
  @Type(() => AddressBookAccountDto)
  @ValidateNested()
  @ApiProperty()
  account: AddressBookAccountDto

  constructor(partial: Partial<CreateAddressBookAccountResponseDto>) {
    Object.assign(this, partial)
  }
}
