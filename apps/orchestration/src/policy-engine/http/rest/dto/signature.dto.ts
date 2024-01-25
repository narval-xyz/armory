import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'

export class SignatureDto {
  @IsString()
  @IsDefined()
  // TODO (@wcalderipe, 23/01/24): Coerce to lowercase once the AuthZ accepts
  // case-insensitive.
  // See https://linear.app/narval/issue/NAR-1531
  //
  // @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'lowercase'
  })
  sig: string

  @IsString()
  @IsDefined()
  // TODO (@wcalderipe, 23/01/24): Coerce to lowercase once the AuthZ accepts
  // case-insensitive.
  // See https://linear.app/narval/issue/NAR-1531
  //
  // @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'lowercase'
  })
  pubKey: string

  @IsEnum(Alg)
  @IsOptional()
  @ApiProperty({
    default: Alg.ES256K,
    enum: Alg,
    required: false
  })
  alg: Alg = Alg.ES256K
}
