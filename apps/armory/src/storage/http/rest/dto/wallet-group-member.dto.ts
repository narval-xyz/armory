import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class WalletGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  groupId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  walletId: string

  constructor(partial: Partial<WalletGroupMemberDto>) {
    Object.assign(this, partial)
  }
}
