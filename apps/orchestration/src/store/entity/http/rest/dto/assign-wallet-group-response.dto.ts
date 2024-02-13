import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { WalletGroupMembershipDto } from './wallet-group-membership.dto'

export class AssignWalletGroupResponseDto {
  @IsDefined()
  @Type(() => WalletGroupMembershipDto)
  @ValidateNested()
  @ApiProperty({
    type: WalletGroupMembershipDto
  })
  data: WalletGroupMembershipDto

  constructor(partial: Partial<AssignWalletGroupResponseDto>) {
    Object.assign(this, partial)
  }
}
