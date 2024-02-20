import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDefined, Matches, ValidateNested } from 'class-validator'
import { TokenDto } from './token.dto'

class RegisterTokensActionDto extends BaseActionDto {
  @Matches(Action.REGISTER_TOKENS)
  @ApiProperty({
    enum: [Action.REGISTER_TOKENS],
    default: Action.REGISTER_TOKENS
  })
  action: typeof Action.REGISTER_TOKENS

  @ArrayNotEmpty()
  @Type(() => TokenDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [TokenDto] })
  tokens: TokenDto[]
}

export class RegisterTokensRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => RegisterTokensActionDto)
  @ValidateNested()
  @ApiProperty()
  request: RegisterTokensActionDto
}
