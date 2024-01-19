import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsOptional, IsString } from 'class-validator'

export class SignatureDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  sig: string

  @IsString()
  @IsDefined()
  @ApiProperty()
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
