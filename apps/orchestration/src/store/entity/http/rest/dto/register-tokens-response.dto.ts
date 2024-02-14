import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, ValidateNested } from 'class-validator'
import { TokenDto } from './token.dto'

export class RegisterTokensResponseDto {
  @ArrayNotEmpty()
  @Type(() => TokenDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [TokenDto] })
  tokens: TokenDto[]

  constructor(partial: Partial<RegisterTokensResponseDto>) {
    Object.assign(this, partial)
  }
}
