import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDefined, IsOptional, IsString } from 'class-validator'

export class SignatureDto {
  @IsString()
  @IsDefined()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'lowercase'
  })
  sig: string

  @IsString()
  @IsDefined()
  @Transform(({ value }) => value.toLowerCase())
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
