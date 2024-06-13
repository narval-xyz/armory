import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'
import { _OLD_PRIVATE_WALLET_ } from '../../../../shared/type/domain.type'

export class ImportPrivateKeyResponseDto {
  constructor(_OLD_WALLET_: _OLD_PRIVATE_WALLET_) {
    this.id = _OLD_WALLET_.id
    this.address = _OLD_WALLET_.address
  }

  @IsString()
  @ApiProperty()
  id: string

  @IsEthereumAddress()
  @ApiProperty()
  address: string
}
