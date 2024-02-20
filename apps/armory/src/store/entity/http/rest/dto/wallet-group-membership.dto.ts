import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class WalletGroupMembershipDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  walletId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  groupId: string

  constructor(partial: Partial<WalletGroupMembershipDto>) {
    Object.assign(this, partial)
  }
}
