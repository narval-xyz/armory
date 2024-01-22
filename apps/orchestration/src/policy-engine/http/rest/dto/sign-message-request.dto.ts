import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNumber, IsString, Min } from 'class-validator'

export class SignMessageRequestDto {
  @IsEnum(SupportedAction)
  @IsDefined()
  @ApiProperty({
    enum: SupportedAction,
    default: SupportedAction.SIGN_MESSAGE
  })
  action: `${SupportedAction.SIGN_MESSAGE}`

  @IsNumber()
  @Min(0)
  @IsDefined()
  @ApiProperty()
  nonce: number

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string
}
