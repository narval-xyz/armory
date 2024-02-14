import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { AddressBookAccountDataDto } from './address-book-account-dto'

export class CreateAddressBookAccountResponseDto {
  @IsDefined()
  @Type(() => AddressBookAccountDataDto)
  @ValidateNested()
  @ApiProperty({
    type: AddressBookAccountDataDto
  })
  account: AddressBookAccountDataDto

  constructor(partial: Partial<CreateAddressBookAccountResponseDto>) {
    Object.assign(this, partial)
  }
}
