import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'
import { PrivateWallet } from '../../../../shared/type/domain.type'

export class ImportPrivateKeyResponseDto {
  constructor(wallet: PrivateWallet) {
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
