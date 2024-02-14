import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { TokenDto } from './token-dto'

export class RegisterTokensResponseDto {
  @Type(() => TokenDto)
  @ValidateNested({ each: true })
  @IsArray()
  @ApiProperty({
    type: TokenDto,
    isArray: true
  })
  tokens: TokenDto[]

  constructor(partial: Partial<RegisterTokensResponseDto>) {
    Object.assign(this, partial)
  }
}
