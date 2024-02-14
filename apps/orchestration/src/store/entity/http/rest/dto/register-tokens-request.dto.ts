import { Action, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { BaseActionDto } from './base-action.dto'
import { TokenDto } from './token-dto'

class RegisterTokensActionDto extends BaseActionDto {
  @IsEnum(Action)
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.REGISTER_TOKENS
  })
  action: typeof Action.REGISTER_TOKENS

  @IsDefined()
  @Type(() => TokenDto)
  @ValidateNested()
  @IsArray()
  @ApiProperty({
    type: TokenDto
  })
  tokens: TokenDto[]
}

export class RegisterTokensRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => RegisterTokensActionDto)
  @ValidateNested()
  @ApiProperty({
    type: RegisterTokensActionDto
  })
  request: RegisterTokensActionDto
}
