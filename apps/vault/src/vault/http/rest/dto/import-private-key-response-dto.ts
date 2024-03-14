import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'
import { Wallet } from '../../../../shared/type/domain.type'

export class ImportPrivateKeyResponseDto {
  constructor(wallet: Wallet) {
    this.id = wallet.id
    this.address = wallet.address
  }

  @IsString()
  @ApiProperty()
  id: string

  @IsEthereumAddress()
  @ApiProperty()
  address: string
}
