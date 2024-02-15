import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserWalletDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  walletId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string

  constructor(partial: Partial<UserWalletDto>) {
    Object.assign(this, partial)
  }
}
