import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { UserWalletDto } from './user-wallet.dto'

export class AssignUserWalletResponseDto {
  @IsDefined()
  @Type(() => UserWalletDto)
  @ValidateNested()
  @ApiProperty({
    type: UserWalletDto
  })
  data: UserWalletDto

  constructor(partial: Partial<AssignUserWalletResponseDto>) {
    Object.assign(this, partial)
  }
}
