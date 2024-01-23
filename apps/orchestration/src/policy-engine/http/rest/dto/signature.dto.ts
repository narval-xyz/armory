import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsOptional, IsString } from 'class-validator'

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

  @IsString()
  @IsOptional()
  @ApiProperty({
    default: 'ES256K',
    enum: ['ES256K'],
    required: false
  })
  alg: string = 'ES256K'
}
