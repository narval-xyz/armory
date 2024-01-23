import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class SignMessageRequestDto {
  @IsEnum(SupportedAction)
  @IsDefined()
  @ApiProperty({
    enum: SupportedAction,
    default: SupportedAction.SIGN_MESSAGE
  })
  action: `${SupportedAction.SIGN_MESSAGE}`

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string
}
