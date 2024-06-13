import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'
import { PrivateAccount } from '../../../../shared/type/domain.type'

export class ImportPrivateKeyResponseDto {
  constructor(account: PrivateAccount) {
    this.id = account.id
    this.address = account.address
  }

  @IsString()
  @ApiProperty()
  id: string

  @IsEthereumAddress()
  @ApiProperty()
  address: string
}
