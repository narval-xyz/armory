import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDefined, ValidateNested } from 'class-validator'
import { Token } from '../../../../shared/types/entities.types'
import { TokenDataDto } from './register-token-dto'

export class RegisterTokensResponseDto {
  constructor(tokens: Token[]) {
    this.tokens = tokens.map((token) => new TokenDataDto(token))
  }

  @IsDefined()
  @ValidateNested()
  @IsArray()
  @ApiProperty()
  tokens: TokenDataDto[]
}
