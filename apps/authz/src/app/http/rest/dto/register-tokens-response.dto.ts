import { TokenDataDto } from '@app/authz/app/http/rest/dto/register-token-dto'
import { Token } from '@app/authz/shared/types/entities.types'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDefined, ValidateNested } from 'class-validator'

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
